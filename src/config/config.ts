import * as dotenv from 'dotenv';
dotenv.config();

export default {
  databaseConfig: {
    db_host: process.env.DB_HOST,
    db_port: parseInt(process.env.DB_PORT),
    db_name: process.env.DB_NAME,
    db_username: process.env.DB_USERNAME,
    db_password: process.env.DB_PASSWORD,
  },
  jwt: {
    secret: process.env.SECRET,
    expiresIn: process.env.EXPIRES_IN,
  },
};
