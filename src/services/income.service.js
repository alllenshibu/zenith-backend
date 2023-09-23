const pool = require('../utils/pg');

const getAllIncomesService = async (user) => {
    try {
        console.log('Getting all incomes');
        const userId = await pool.query('SELECT id FROM "user" WHERE email = $1', [user]);

        if (userId?.rows?.length === 0) {
            throw new Error('User not found');
        }

        const result = await pool.query('SELECT * FROM income WHERE user_id = $1', [userId?.rows[0]?.id]);

        // if (result?.rows?.length > 0) {
        //     return result?.rows;
        // } else {
        //     throw new Error('Something went wrong');
        // }
        return result?.rows;
    } catch (err) {
        throw new Error(err.message);
    }
}


const getIncomeByIdService = async (user, incomeId) => {
    try {
        console.log('Getting income by id');
        const userId = await pool.query('SELECT id FROM "user" WHERE email = $1', [user]);

        if (userId?.rows?.length === 0) {
            throw new Error('User not found');
        }

        const result = await pool.query('SELECT * FROM income WHERE user_id = $1 AND id = $2', [userId?.rows[0]?.id, incomeId]);
        if (result?.rows?.length > 0) {
            return result?.rows[0];
        } else {
            throw new Error('Something went wrong');
        }
    } catch (err) {
        throw new Error(err.message);
    }
}


const addNewIncomeService = async (user, title, amount, timestamp, stable, endsOn) => {
    try {
        console.log('Adding income');
        const userId = await pool.query('SELECT id FROM "user" WHERE email = $1', [user]);

        if (userId?.rows?.length === 0) {
            throw new Error('User not found');
        }

        console.log({ stable });

        if (stable === true) {
            const currentDate = new Date();
            const currentMonth = currentDate.getMonth() + 1;
            const currentYear = currentDate.getFullYear();
            const em = new Date(endsOn)
            const endsOnMonth = em.getMonth() + 1;
            const endsOnYear = em.getFullYear();
            console.log({ endsOnMonth, endsOnYear })

            let i = currentMonth;
            let j = currentYear;
            do {
                console.log('Adding income for month: ', i);
                const result = await pool.query('INSERT INTO income (user_id, title, amount, timestamp) VALUES ($1, $2, $3, $4) RETURNING id', [userId?.rows[0]?.id, title, amount, timestamp]);
                (new Date(timestamp)).setMonth((new Date(timestamp)).getMonth() + 1);
                i++;
                if (i > 12) {
                    i = 1;
                    j++;
                }
                if (result?.rows?.length <= 0) {
                    throw new Error('Something went wrong');
                }

                if (i === endsOnMonth && j === endsOnYear) {
                    return result?.rows[0]?.id;
                }
            } while (true);
        }

        const result = await pool.query('INSERT INTO income (user_id, title, amount, timestamp) VALUES ($1, $2, $3, $4) RETURNING id', [userId?.rows[0]?.id, title, amount, timestamp]);
        if (result?.rows?.length > 0) {
            return result?.rows[0]?.id;
        } else {
            throw new Error('Something went wrong');
        }
    } catch (err) {

        throw new Error(err.message);
    }
}

module.exports = {
    getAllIncomesService,
    getIncomeByIdService,
    addNewIncomeService
}
