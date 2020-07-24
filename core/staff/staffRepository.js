'use strict';

const db = require('../../config/database');
const { param } = require('../../config/server');

module.exports = {
    create,
    update,
    select,
    selectById,
    remove
}

async function create(params) {

    try {

        let result = await db.query(`
            INSERT INTO hr.staff(
                name, 
                hireddate, 
                occurredat
            )
            VALUES(
                '${params.name}', 
                '${params.hiredDate}',
                (to_timestamp(${Date.now()} / 1000))
            )
            RETURNING id;
        `);

        //link and adding staff adresses
        let adressResult;

        for (let i = 0; i < params.adress.length; i++) {

            adressResult = await db.query(`
                INSERT INTO crm.adress(
                    street, 
                    neighborhood,
                    "number",
                    complement,
                    cep,
                    city,
                    country,
                    main
                )
                VALUES(
                    '${params.adress[i].street}',
                    '${params.adress[i].neighborhood}',
                    ${+params.adress[i].number},
                    '${params.adress[i].complement || ''}',
                    ${+params.adress[i].cep},
                    '${params.adress[i].city}',
                    '${params.adress[i].country}',
                    ${params.adress[i].main || false}
                )

                RETURNING id;
            `);

            await db.query(`
                INSERT INTO hr.staffadress(
                    idstaff,
                    idadress
                )
                VALUES(
                    ${+result.rows[0].id},
                    ${+adressResult.rows[0].id}
                )
            `)

        };

        //link and adding staff email

        let emailResult;

        for (let i = 0; i < params.email.length; i++) {

            emailResult = await db.query(`
                INSERT INTO crm.email(
                    email,
                    main
                )
                VALUES(
                    '${params.email[i].email}',
                    ${params.email[i].main || false}
                )
                RETURNING id;
            `);

            await db.query(`
                INSERT INTO hr.staffemail(
                    idstaff,
                    idemail
                )
                VALUES(
                    ${+result.rows[0].id},
                    ${+emailResult.rows[0].id}
                )
            `)

        };

        //link and adding staff telephone

        let telephoneResult;

        for (let i = 0; i < params.telephone.length; i++) {

            telephoneResult = await db.query(`
                INSERT INTO crm.telephone(
                    countryarea,
                    "number",
                    main
                )
                VALUES(
                    ${+params.telephone[i].countryArea},
                    ${+params.telephone[i].number},
                    ${params.telephone[i].main || false}
                )
                RETURNING id;
            `);

            await db.query(`
                INSERT INTO hr.stafftelephone(
                    idstaff,
                    idtelephone
                )
                VALUES(
                    ${+result.rows[0].id},
                    ${+telephoneResult.rows[0].id}
                )
            `)

        };

        //link and adding staff job positions

        for (let i = 0; i < params.jobPosition.length; i++) {

            await db.query(`
                INSERT INTO hr.staffjobPosition(
                    idstaff,
                    idjobPosition,
                    main,
                    occupiedAt
                )
                VALUES(
                    ${+result.rows[0].id},
                    ${+params.jobPosition[i].id},
                    ${params.jobPosition[i].main || false},
                    '${params.jobPosition[i].occupiedAt}'
                )
            `)

        };

        return result.rows[0];
    } catch (error) {
        return error;
    }
}

async function update(params) {
    try {

        await db.query(`
            UPDATE hr.staff
            SET
                name = '${params.name}',
                hireddate = '${params.hiredDate}'
            WHERE id = ${params.id};    
        `);

        //link and adding staff adresses which is not in db 
        let adressResult;

        for (let i = 0; i < params.adress.length; i++) {

            if (!params.adress[i].id) {

                adressResult = await db.query(`
                    INSERT INTO crm.adress(
                        street, 
                        neighborhood,
                        number,
                        complement,
                        cep,
                        city,
                        country,
                        main
                    )
                    VALUES(
                        '${params.adress[i].street}',
                        '${params.adress[i].neighborhood}',
                        ${params.adress[i].number},
                        '${params.adress[i].complement || ''}',
                        ${params.adress[i].cep},
                        '${params.adress[i].city}',
                        '${params.adress[i].country}',
                        ${params.adress[i].main || false}
                    )

                    RETURNING id;
                `);
                params.adress[i].id = adressResult.rows[0].id;

                await db.query(`
                    INSERT INTO hr.staffadress(
                        idstaff,
                        idadress
                    )
                    VALUES(
                        ${params.id},
                        ${+adressResult.rows[0].id}
                    )
                `);
            }
            else {
                await db.query(`
                    UPDATE crm.adress
                    SET 
                        street = '${params.adress[i].street}',
                        neighborhood = '${params.adress[i].neighborhood}',
                        number = ${params.adress[i].number},
                        complement = '${params.adress[i].complement}',
                        cep = ${params.adress[i].cep},
                        city = '${params.adress[i].city}',
                        country = '${params.adress[i].country}',
                        main = '${params.adress[i].main}'
                    WHERE id = ${params.adress[i].id}
                `)
            }

        };

        //unlinking staff adresses 
        let adressIds = [];

        params.adress.map(x => {
            adressIds.push(x.id);
        });

        await db.query(`
            DELETE FROM hr.staffadress 
            WHERE idstaff = ${params.id} AND idadress NOT IN (${adressIds});
        `);

        //link and adding staff email which is not in db

        let emailResult;

        for (let i = 0; i < params.email.length; i++) {

            if (!params.email[i].id) {

                emailResult = await db.query(`
                    INSERT INTO crm.email(
                        email,
                        main
                    )
                    VALUES(
                        '${params.email[i].email}',
                        ${params.email[i].main || false}
                    )
                    RETURNING id;
                `);

                params.email[i].id = adressResult.rows[0].id;

                await db.query(`
                    INSERT INTO hr.staffemail(
                        idstaff,
                        idemail
                    )
                    VALUES(
                        ${+params.id},
                        ${+emailResult.rows[0].id}
                    )
                `);
            }
            else {
                await db.query(`
                    UPDATE crm.email
                    SET 
                        email = '${params.email[i].email}',
                        main = '${params.email[i].main}'
                    WHERE id  = ${params.email[i].id}
                `);
            }
        };

         //unlinking staff emails
         let emailIds = [];

         params.email.map(x => {
             emailIds.push(x.id);
         });

         await db.query(`
             DELETE FROM hr.staffemail 
             WHERE idstaff = ${params.id} AND idemail NOT IN (${emailIds});
         `);

        //link and adding staff telephone which is not in db

        let telephoneResult;

        for (let i = 0; i < params.telephone.length; i++) {

            if (!params.telephone[i].id) {

                telephoneResult = await db.query(`
                    INSERT INTO crm.telephone(
                        countryarea,
                        "number",
                        main
                    )
                    VALUES(
                        ${+params.telephone[i].countryArea},
                        ${+params.telephone[i].number},
                        ${params.telephone[i].main || false}
                    )
                    RETURNING id;
                `);

                params.telephone[i].id = adressResult.rows[0].id;

                await db.query(`
                    INSERT INTO hr.stafftelephone(
                        idstaff,
                        idtelephone
                    )
                    VALUES(
                        ${+params.id},
                        ${+telephoneResult.rows[0].id}
                    )
                `);
            }

            else {
                await db.query(`
                    UPDATE crm.telephone
                    SET 
                        countryarea = ${params.telephone[i].countryArea},
                        "number" = ${params.telephone[i].number},
                        main = ${params.telephone[i].main}
                    WHERE id  = ${params.telephone[i].id}
                `);
            }
        }

        //unlinking staff telephones
        let telephoneIds = [];

        params.telephone.map(x => {
            telephoneIds.push(x.id);
        });

        await db.query(`
            DELETE FROM hr.stafftelephone 
            WHERE idstaff = ${params.id} AND idtelephone NOT IN (${telephoneIds});
        `);

        //link and staff job positions which is not in db 

        let jobPositionResult;

        for (let i = 0; i < params.jobPosition.length; i++) {

            jobPositionResult = await db.query(`
                SELECT
                (CASE WHEN exists
                    (SELECT TRUE FROM hr.staffjobposition 
                        WHERE idstaff = ${params.id}
                        AND idjobposition = ${params.jobPosition[i].id}) 
                THEN true else false end) AS bool;
            `);

            if (!jobPositionResult.rows[0].bool) {

                await db.query(`
                    INSERT INTO hr.staffjobposition(
                        idstaff,
                        idjobposition,
                        main,
                        occupiedat
                    )
                    VALUES(
                        ${+params.id},
                        ${+params.jobPosition[i].id},
                        ${params.jobPosition[i].main || false},
                        '${params.jobPosition[i].occupiedAt}'
                    )
                `);
            }

            else {
                await db.query(`
                    UPDATE hr.staffjobposition
                        SET
                        main = ${params.jobPosition[i].main}
                    WHERE idstaff = ${params.id} AND idjobposition = ${params.jobPosition[i].id};
                `);
            }

        }

        return params.id;
    
    } catch (error) {
        return error;
    }
}

async function select(params) {
    try {
        let result = await db.query(
            `
            SELECT 
                s.id,
                s.name,
                s.hireddate AS "hiredDate",
                s.fireddate AS "firedDate",
                s.occurredat
            FROM hr.staff s
            ORDER BY id asc
        `
        );

        return result.rows;
    } catch (error) {
        return error;
    }
}

async function selectById(params) {
    try {
        let result = await db.query(
            `
            SELECT 
                s.id,
                s.name,
                s.hireddate AS "hiredDate",
                s.fireddate AS "firedDate",
                s.occurredat,
                (SELECT json_agg(x) as adress FROM(
                    SELECT DISTINCT
                        a.id,
                        a.street,
                        a.neighborhood,
                        a.number,
                        a.complement,
                        a.cep,
                        a.city,
                        a.country,
                        a.main
                    FROM crm.adress a
                    INNER JOIN hr.staffadress sa
                        ON sa.idadress = a.id
                    INNER JOIN hr.staff s
                        ON ${params.id} = sa.idstaff
                )x),
                (SELECT json_agg(x) as email FROM(
                    SELECT DISTINCT
                        e.id,
                        e.email,
                        e.main
                    FROM crm.email e
                    INNER JOIN hr.staffemail se
                        ON se.idemail = e.id
                    INNER JOIN hr.staff s
                        ON ${params.id} = se.idstaff
                )x),
                (SELECT json_agg(x) as telephone FROM(
                    SELECT DISTINCT
                        t.id,
                        t.countryarea AS "countryArea",
                        t.number,
                        t.main 
                    FROM crm.telephone t
                    INNER JOIN hr.stafftelephone st
                        ON st.idtelephone = t.id
                    INNER JOIN hr.staff s
                        ON ${params.id} = st.idstaff
                )x),
                (SELECT json_agg(x) as "jobPosition" FROM(
                    SELECT DISTINCT
                        jp.id,
                        jp.name,
                        jp.salary,
                        sjp.main,
                        sjp.occupiedat AS "occupiedAt" 
                    FROM hr.jobposition jp
                    INNER JOIN hr.staffjobposition sjp
                        ON sjp.idjobposition = jp.id
                    INNER JOIN hr.staff s
                        ON ${params.id} = sjp.idstaff
                )x)
            FROM hr.staff s
            WHERE s.id = ${params.id}
        `
        );

        return result.rows[0];
    } catch (error) {
        return error;
    }
}

async function remove(params) {

    try {

        let result = await db.query(`
            UPDATE hr.staff
                SET
                fireddate = (to_timestamp(${Date.now()} / 1000))
            WHERE id = ${params.id}
        `);

        return result.rows;
    } catch (error) {
        return error;
    }
}
