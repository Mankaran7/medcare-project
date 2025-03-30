const db = require('../config/db');
const bcrypt = require('bcrypt');

const seedAdmin = async () => {
    try {
       
        const existingAdmin = await db.oneOrNone(
            'SELECT * FROM users WHERE user_emailid = $1',
            [process.env.ADMIN_EMAIL]
        );

        if (!existingAdmin) {
           
            const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

         
            await db.none(
                `INSERT INTO users (user_name, user_emailid, password,role) 
                VALUES ($1, $2, $3,$4)`,
                ['Admin', process.env.ADMIN_EMAIL, hashedPassword,'admin']
            );
            console.log('Admin user created successfully');
        } else {
            console.log('Admin user already exists');
        }
    } catch (error) {
        console.error('Error seeding admin:', error);
    }
};

module.exports = seedAdmin; 