import { relations, sql } from 'drizzle-orm'
import { integer, primaryKey, real, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

export const roles = sqliteTable('roles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  code: text('code', { enum: ['ADMIN', 'USER'] }).notNull(),
  name: text('name').notNull(),
  isSystem: integer('is_system', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`)
}, table => [uniqueIndex('roles_code_unique').on(table.code)])

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull(),
  displayName: text('display_name').notNull(),
  passwordHash: text('password_hash').notNull(),
  status: text('status', { enum: ['ACTIVE', 'DISABLED'] }).notNull().default('ACTIVE'),
  passwordVersion: integer('password_version').notNull().default(1),
  lastLoginAt: integer('last_login_at', { mode: 'timestamp_ms' }),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`)
}, table => [uniqueIndex('users_username_unique').on(table.username)])

export const userRoles = sqliteTable('user_roles', {
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  roleId: integer('role_id').notNull().references(() => roles.id, { onDelete: 'restrict' }),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`)
}, table => [primaryKey({ columns: [table.userId, table.roleId] })])

export const systemSettings = sqliteTable('system_settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`)
})

export const usersRelations = relations(users, ({ many }) => ({ userRoles: many(userRoles) }))
export const rolesRelations = relations(roles, ({ many }) => ({ userRoles: many(userRoles) }))
export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, { fields: [userRoles.userId], references: [users.id] }),
  role: one(roles, { fields: [userRoles.roleId], references: [roles.id] })
}))

export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  parentId: integer('parent_id').references((): any => categories.id, { onDelete: 'restrict' }),
  sortOrder: integer('sort_order').notNull().default(0),
  status: text('status', { enum: ['ACTIVE', 'DISABLED'] }).notNull().default('ACTIVE'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`)
}, table => [uniqueIndex('categories_parent_name_unique').on(table.parentId, table.name)])

export const ingredients = sqliteTable('ingredients', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  defaultUnit: text('default_unit').notNull().default('克'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`)
}, table => [uniqueIndex('ingredients_name_unique').on(table.name)])

export const dishes = sqliteTable('dishes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description').notNull().default(''),
  imageUrl: text('image_url'),
  status: text('status', { enum: ['IDEA', 'TRIED', 'NEEDS_POLISH', 'PUBLISHED', 'OFF_SHELF'] }).notNull().default('IDEA'),
  cookingMinutes: integer('cooking_minutes'),
  difficulty: text('difficulty', { enum: ['EASY', 'MEDIUM', 'HARD'] }).notNull().default('EASY'),
  createdBy: integer('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`)
})

export const dishCategories = sqliteTable('dish_categories', {
  dishId: integer('dish_id').notNull().references(() => dishes.id, { onDelete: 'cascade' }),
  categoryId: integer('category_id').notNull().references(() => categories.id, { onDelete: 'restrict' })
}, table => [primaryKey({ columns: [table.dishId, table.categoryId] })])

export const dishIngredients = sqliteTable('dish_ingredients', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  dishId: integer('dish_id').notNull().references(() => dishes.id, { onDelete: 'cascade' }),
  ingredientId: integer('ingredient_id').notNull().references(() => ingredients.id, { onDelete: 'restrict' }),
  amount: real('amount').notNull(),
  unit: text('unit').notNull(),
  note: text('note').notNull().default(''),
  sortOrder: integer('sort_order').notNull().default(0)
}, table => [uniqueIndex('dish_ingredients_dish_ingredient_unique').on(table.dishId, table.ingredientId)])

export const recipeSteps = sqliteTable('recipe_steps', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  dishId: integer('dish_id').notNull().references(() => dishes.id, { onDelete: 'cascade' }),
  stepNo: integer('step_no').notNull(),
  content: text('content').notNull()
}, table => [uniqueIndex('recipe_steps_dish_step_unique').on(table.dishId, table.stepNo)])

export const orders = sqliteTable('orders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
  scheduledDate: text('scheduled_date').notNull(),
  mealSlot: text('meal_slot', { enum: ['LUNCH', 'DINNER'] }).notNull(),
  note: text('note').notNull().default(''),
  status: text('status', { enum: ['PENDING', 'ACCEPTED', 'PREPARING', 'COMPLETED', 'REJECTED', 'CANCELLED'] }).notNull().default('PENDING'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`)
})

export const orderItems = sqliteTable('order_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orderId: integer('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  dishId: integer('dish_id').references(() => dishes.id, { onDelete: 'set null' }),
  dishName: text('dish_name').notNull(),
  dishImageUrl: text('dish_image_url'),
  quantity: integer('quantity').notNull().default(1)
})

export const orderIngredientChecks = sqliteTable('order_ingredient_checks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orderId: integer('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  unit: text('unit').notNull(),
  checked: integer('checked', { mode: 'boolean' }).notNull().default(false),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`)
}, table => [uniqueIndex('order_ingredient_checks_order_item_unique').on(table.orderId, table.name, table.unit)])

export const orderStatusHistory = sqliteTable('order_status_history', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orderId: integer('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  fromStatus: text('from_status'),
  toStatus: text('to_status').notNull(),
  operatorUserId: integer('operator_user_id').references(() => users.id, { onDelete: 'set null' }),
  note: text('note').notNull().default(''),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`)
})

export const orderRatings = sqliteTable('order_ratings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orderId: integer('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
  rating: text('rating', { enum: ['GOOD', 'NEUTRAL', 'BAD'] }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`)
}, table => [uniqueIndex('order_ratings_order_unique').on(table.orderId)])

export const notifications = sqliteTable('notifications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type', { enum: ['ORDER', 'REQUEST', 'SYSTEM'] }).notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  link: text('link'),
  readAt: integer('read_at', { mode: 'timestamp_ms' }),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`)
})

export const pushSubscriptions = sqliteTable('push_subscriptions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  endpoint: text('endpoint').notNull(),
  p256dh: text('p256dh').notNull(),
  auth: text('auth').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`)
}, table => [uniqueIndex('push_subscriptions_endpoint_unique').on(table.endpoint)])

export const dishRequests = sqliteTable('dish_requests', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
  name: text('name').notNull(),
  description: text('description').notNull().default(''),
  status: text('status', { enum: ['SUBMITTED', 'RESEARCHING', 'REJECTED', 'CONVERTED', 'PUBLISHED'] }).notNull().default('SUBMITTED'),
  adminNote: text('admin_note').notNull().default(''),
  linkedDishId: integer('linked_dish_id').references(() => dishes.id, { onDelete: 'set null' }),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`)
})

export const requestStatusHistory = sqliteTable('request_status_history', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  requestId: integer('request_id').notNull().references(() => dishRequests.id, { onDelete: 'cascade' }),
  fromStatus: text('from_status'),
  toStatus: text('to_status').notNull(),
  operatorUserId: integer('operator_user_id').references(() => users.id, { onDelete: 'set null' }),
  note: text('note').notNull().default(''),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`)
})

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, { fields: [categories.parentId], references: [categories.id], relationName: 'categoryTree' }),
  children: many(categories, { relationName: 'categoryTree' }),
  dishCategories: many(dishCategories)
}))
export const dishesRelations = relations(dishes, ({ many }) => ({
  dishCategories: many(dishCategories),
  ingredients: many(dishIngredients),
  recipeSteps: many(recipeSteps)
}))
export const dishCategoriesRelations = relations(dishCategories, ({ one }) => ({
  dish: one(dishes, { fields: [dishCategories.dishId], references: [dishes.id] }),
  category: one(categories, { fields: [dishCategories.categoryId], references: [categories.id] })
}))
export const dishIngredientsRelations = relations(dishIngredients, ({ one }) => ({
  dish: one(dishes, { fields: [dishIngredients.dishId], references: [dishes.id] }),
  ingredient: one(ingredients, { fields: [dishIngredients.ingredientId], references: [ingredients.id] })
}))
export const recipeStepsRelations = relations(recipeSteps, ({ one }) => ({
  dish: one(dishes, { fields: [recipeSteps.dishId], references: [dishes.id] })
}))

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  items: many(orderItems),
  history: many(orderStatusHistory),
  rating: one(orderRatings, { fields: [orders.id], references: [orderRatings.orderId] })
}))
export const orderItemsRelations = relations(orderItems, ({ one }) => ({ order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }) }))
export const orderIngredientChecksRelations = relations(orderIngredientChecks, ({ one }) => ({ order: one(orders, { fields: [orderIngredientChecks.orderId], references: [orders.id] }) }))
export const orderRatingsRelations = relations(orderRatings, ({ one }) => ({
  order: one(orders, { fields: [orderRatings.orderId], references: [orders.id] }),
  user: one(users, { fields: [orderRatings.userId], references: [users.id] })
}))
export const notificationsRelations = relations(notifications, ({ one }) => ({ user: one(users, { fields: [notifications.userId], references: [users.id] }) }))
export const pushSubscriptionsRelations = relations(pushSubscriptions, ({ one }) => ({ user: one(users, { fields: [pushSubscriptions.userId], references: [users.id] }) }))
export const dishRequestsRelations = relations(dishRequests, ({ one, many }) => ({
  user: one(users, { fields: [dishRequests.userId], references: [users.id] }),
  dish: one(dishes, { fields: [dishRequests.linkedDishId], references: [dishes.id] }),
  history: many(requestStatusHistory)
}))

export type RoleCode = typeof roles.$inferSelect.code
export type UserStatus = typeof users.$inferSelect.status
export type DishStatus = typeof dishes.$inferSelect.status
export type OrderStatus = typeof orders.$inferSelect.status
export type OrderRating = typeof orderRatings.$inferSelect.rating
export type RequestStatus = typeof dishRequests.$inferSelect.status
export type UiTheme = 'peach-kitchen' | 'mint-bento'
