import 'dotenv/config';

export const env = {
  port: process.env.PORT || 3000,
  databaseUrl: process.env.DATABASE_URL,
  jwt: {
    accessSecret: process.env.ACCESS_SECRET,
    refreshSecret: process.env.REFRESH_SECRET,
    accessExpiresIn: process.env.ACCESS_EXPIRE,
    refreshExpiresIn: process.env.REFRESH_EXPIRE,
  },
  node: process.env.NODE_ENV || 'development',
};
