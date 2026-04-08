import { createConnection } from 'mysql2/promise';

export const mysqlProvider = {
  provide: 'MYSQL_CONNECTION',
  useFactory: async () => {
    const connection = await createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: 'linux',
      database: 'edm_db',
    });
    return connection;
  },
};
