// import dotenv from "dotenv";
// dotenv.config();

// import bcrypt from "bcryptjs";

// import db from "../config/db.js";
// import logger from "../utils/logger.js";

// async function main() {
//     try {
//         logger.info("Starting database seed...");

//         /*
//         =========================================
//         SUPER ADMIN
//         =========================================
//         */

//         const adminPassword = await bcrypt.hash(
//             "Admin@1234",
//             12
//         );

//         await db.query(
//             `
//             INSERT INTO users (
//                 email,
//                 password,
//                 name,
//                 role,
//                 employee_code,
//                 is_active,
//                 is_first_login,
//                 must_change_password,
//                 policy_accepted_at
//             )
//             VALUES (
//                 $1,$2,$3,$4,$5,$6,$7,$8,$9
//             )
//             ON CONFLICT (email)
//             DO NOTHING
//             `,
//             [
//                 "admin@difm.com",
//                 adminPassword,
//                 "Super Admin",
//                 "SUPER_ADMIN",
//                 "SA-001",
//                 true,
//                 false,
//                 false,
//                 new Date(),
//             ]
//         );

//         logger.info("Super admin created");
//         logger.info("Email : admin@difm.com");
//         logger.info("Password : Admin@1234");

//         /*
//         =========================================
//         INTERN
//         =========================================
//         */

//         const internTempPassword = "Intern@123";

//         const internTempHash = await bcrypt.hash(
//             internTempPassword,
//             12
//         );

//         await db.query(
//             `
//             INSERT INTO users (
//                 email,
//                 password,
//                 temp_password,
//                 name,
//                 role,
//                 employee_code,
//                 is_active,
//                 is_first_login,
//                 must_change_password,
//                 face_registered,
//                 policy_accepted_at
//             )
//             VALUES (
//                 $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11
//             )
//             ON CONFLICT (email)
//             DO NOTHING
//             `,
//             [
//                 "intern@difm.com",
//                 null,
//                 internTempHash,
//                 "Test Intern",
//                 "INTERN",
//                 "INT-001",
//                 true,
//                 true,
//                 true,
//                 false,
//                 null,
//             ]
//         );

//         logger.info("Intern user created");
//         logger.info("Email : intern@difm.com");
//         logger.info(
//             `Temporary Password : ${internTempPassword}`
//         );

//         /*
//         =========================================
//         HR
//         =========================================
//         */

//         const hrPassword = await bcrypt.hash(
//             "HR@1234",
//             12
//         );

//         await db.query(
//             `
//             INSERT INTO users (
//                 email,
//                 password,
//                 name,
//                 role,
//                 employee_code,
//                 is_active,
//                 is_first_login,
//                 must_change_password,
//                 policy_accepted_at
//             )
//             VALUES (
//                 $1,$2,$3,$4,$5,$6,$7,$8,$9
//             )
//             ON CONFLICT (email)
//             DO NOTHING
//             `,
//             [
//                 "hr@difm.com",
//                 hrPassword,
//                 "HR Manager",
//                 "HR_ADMIN",
//                 "HR-001",
//                 true,
//                 false,
//                 false,
//                 new Date(),
//             ]
//         );

//         logger.info("HR user created");
//         logger.info("Email : hr@difm.com");
//         logger.info("Password : HR@1234");

//         /*
//         =========================================
//         SHIFTS
//         =========================================
//         */

//         const shifts = [
//             {
//                 name: "Day Shift",
//                 shift_type: "DAY",
//                 start_time: "09:00",
//                 end_time: "18:00",
//                 duration_hours: 8,
//                 is_night_shift: false,
//             },

//             {
//                 name: "Evening Shift",
//                 shift_type: "EVENING",
//                 start_time: "14:00",
//                 end_time: "23:00",
//                 duration_hours: 8,
//                 is_night_shift: false,
//             },

//             {
//                 name: "Night Shift",
//                 shift_type: "NIGHT",
//                 start_time: "22:00",
//                 end_time: "06:00",
//                 duration_hours: 8,
//                 is_night_shift: true,
//             },
//         ];

//         for (const shift of shifts) {
//             await db.query(
//                 `
//                 INSERT INTO shifts (
//                     name,
//                     shift_type,
//                     start_time,
//                     end_time,
//                     duration_hours,
//                     is_night_shift
//                 )
//                 VALUES (
//                     $1,$2,$3,$4,$5,$6
//                 )
//                 ON CONFLICT (name)
//                 DO NOTHING
//                 `,
//                 [
//                     shift.name,
//                     shift.shift_type,
//                     shift.start_time,
//                     shift.end_time,
//                     shift.duration_hours,
//                     shift.is_night_shift,
//                 ]
//             );

//             logger.info(
//                 `Shift created : ${shift.name}`
//             );
//         }

//         logger.info("Database seeding completed");

//         process.exit(0);

//     } catch (error) {

//         logger.error(
//             "Error during database seeding:",
//             error
//         );

//         process.exit(1);
//     }
// }

// main();