import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './src/config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const fullName = process.env.ADMIN_FULLNAME || process.env.ADMIN_NAME || 'ParkEase Admin';
const email = (process.env.ADMIN_EMAIL || 'admin@parkease.com').trim().toLowerCase();

async function createAdmin() {
  try {
    const [existing] = await pool.execute(
      'SELECT id, email, role FROM users WHERE email = ? LIMIT 1',
      [email]
    );

    if (existing.length > 0) {
      const user = existing[0];

      if (user.role === 'ADMIN') {
        const updatePassword = process.env.ADMIN_PASSWORD;
        if (updatePassword && updatePassword.length >= 12) {
          const passwordHash = await bcrypt.hash(updatePassword, 12);
          await pool.execute(
            'UPDATE users SET password_hash = ?, full_name = ? WHERE id = ?',
            [passwordHash, fullName, user.id]
          );
          console.log('Existing admin account password successfully updated.');
          console.log(`Email: ${user.email}`);
          console.log('Role: ADMIN');
          return;
        }

        console.log('An admin account with this email already exists.');
        console.log(`Email: ${user.email}`);
        console.log('To update its password, supply ADMIN_PASSWORD (min 12 chars).');
        return;
      }

      console.error(
        'This email already belongs to a non-admin account. No changes made.'
      );
      process.exitCode = 1;
      return;
    }

    const password = process.env.ADMIN_PASSWORD;

    if (!password || password.length < 12) {
      throw new Error(
        'Set ADMIN_PASSWORD to a password of at least 12 characters.'
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const [result] = await pool.execute(
      `INSERT INTO users (full_name, email, password_hash, role)
       VALUES (?, ?, ?, 'ADMIN')`,
      [fullName, email, passwordHash]
    );

    console.log('Admin account created successfully!');
    console.log(`User ID: ${result.insertId}`);
    console.log(`Email: ${email}`);
    console.log('Role: ADMIN');
    console.log('Password: The password you supplied through ADMIN_PASSWORD.');
  } finally {
    await pool.end();
  }
}

createAdmin().catch((error) => {
  console.error('Failed to create admin:', error.message);
  process.exitCode = 1;
});
