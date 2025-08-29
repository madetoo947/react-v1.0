import bcrypt from 'bcryptjs'

// Хеширование пароля (вызывается перед сохранением в БД)
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10)
  return await bcrypt.hash(password, salt)
}

// Проверка пароля (при входе пользователя)
export const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword)
}

// Генерация токена (можно использовать JWT)
export const generateToken = (userId) => {
  // В реальном приложении используйте библиотеку jsonwebtoken
  return `token-${userId}-${Date.now()}`
}

// Проверка ролей пользователя
export const checkRole = (user, requiredRole) => {
  if (!user) return false
  return user.role === requiredRole
}

// Валидация email
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

// Валидация пароля (мин. 8 символов, цифры и буквы)
export const validatePassword = (password) => {
  return (
    password.length >= 8 && /\d/.test(password) && /[a-zA-Z]/.test(password)
  )
}
