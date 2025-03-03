import { form, LevelEnum, PrismaClient, schoolclass, skill, student, studenttest, studenttesthasskill, test, TrimesterEnum, user, UserRoleEnum } from '@prisma/client'
import { fakerFR as faker } from '@faker-js/faker';
const prisma = new PrismaClient()
async function main() {
    await createUsersAndProfiles(2);
    const forms = await createForms();
    const skills = await createSkills();
    const schoolClasses = await createSchoolClasses(8, forms);
    const students = await createStudents(50);
    const tests = await createTests(10, schoolClasses);
    const studentTests = await createStudentTests(80, students, tests)
    await createStudentTestHasSkill(skills, studentTests)
}


const createUsersAndProfiles = async (number: number): Promise<user[]> => {
    const users = []
    while (number) {
        users.push(await prisma.user.create({
            data: {
                email: faker.internet.email(),
                password: faker.internet.password(),
                role: UserRoleEnum.TEACHER,
                profile: {
                    create: {
                        firstname: faker.person.firstName(),
                        lastname: faker.person.lastName(),
                        school: faker.company.buzzNoun()
                    }
                }
            }
        }));
        number--
    }
    return users;
}

const createForms = async (): Promise<form[]> => {
    const formList = ['2ND', '1G', '1STMG', '1HLP', 'THLP', 'BTS'];

    return Promise.all(
        formList.map(name => prisma.form.create({ data: { name } }))
    );
};

const createSkills = async (): Promise<skill[]> => {
    const skillList = ['ORAL', 'ECRIT', 'CULTURE', 'GRAMMAIRE', 'LECTURE', 'AUTRE'];

    return Promise.all(
        skillList.map(skill => prisma.skill.create({
             data: {
                name: skill,
                createdBy: {
                    connect: {
                        id: 1
                    }
                }
            }
         }
        ))
    );
};



const createSchoolClasses = async (number: number, forms: form[]): Promise<schoolclass[]> => {
    const schoolClasses = []
    while (number) {        
        schoolClasses.push(await prisma.schoolclass.create({
            data: {
                name: faker.lorem.word(3),
                color: faker.color.rgb(),
                form: {
                    connect: {
                        id: getRandomId(forms.length)
                    }
                }
            }
        }));
        number--
    }
    return schoolClasses;
}


const createStudents = async (number: number): Promise<student[]> => {
    const students = []
    while (number) {
        students.push(await prisma.student.create({
            data: {
                firstName: faker.person.firstName(),
                lastName: faker.person.lastName(),
                schoolClasses: {
                    connect: {
                        id: getRandomId(8)
                    }
                }
            }
        }));
        number--
    }
    return students;
}

const createTests = async (number: number, schoolClasses: schoolclass[]): Promise<test[]> => {
    const tests = []
    while (number) {
        tests.push(await prisma.test.create({
            data: {
                date: faker.date.recent(),
                description: faker.lorem.sentence(2),
                scale: 20,
                coefficient: getRandomNumber(3),
                trimester: faker.helpers.enumValue(TrimesterEnum),
                schoolclass: {
                    connect: {
                        id: getRandomId(schoolClasses.length)
                    }
                }
            }
        }));
        number--
    }
    return tests;
}

const createStudentTests = async (number: number, students: student[], tests: test[]): Promise<studenttest[]> => {
    const studentTests = []
    while (number) {
        const studentId = getRandomId(students.length);
        const testId = getRandomId(tests.length);

        // Ensure that studentId and testId are within valid range
        const validStudent = students.find(student => student.id === studentId);
        const validTest = tests.find(test => test.id === testId);

        if (validStudent && validTest) {
            studentTests.push(await prisma.studenttest.upsert({
                where: {
                    studentTestId: {
                        studentId: studentId,
                        testId: testId,
                    }
                },
                update: {},
                create: {
                    studentId: studentId,
                    testId: testId,
                    mark: getRandomNumber(20),  // Assuming you have a getRandomNumber function to generate marks
                }
            }));
        }
        number--;
    }
    return studentTests;
}

const createStudentTestHasSkill = async (skills: skill[], studentTests: studenttest[]): Promise<studenttesthasskill[]> => {
    const studentTestHasSkill = []
    
    // Create a new entry for each studentTest and skill combination
    for (const studentTest of studentTests) {
        const skillId = getRandomId(skills.length);

        // Insert a new record for studenttesthasskill
        const studentTestHasSkillEntry = await prisma.studenttesthasskill.upsert({
            where: {
                studentTestSkillId: {
                    skillId: skillId,
                    studentTestId: studentTest.id
                }
            },
            update: {},
            create: {
                level: faker.helpers.enumValue(LevelEnum), 
                skill: {
                    connect: { id: skillId }
                },
                studenttest: {
                    connect: { id: studentTest.id }
                }
            }
        });
        studentTestHasSkill.push(studentTestHasSkillEntry);
    }
    
    return studentTestHasSkill;
}


const getRandomNumber = (max: number): number => {
    return Math.floor(Math.random() * max);
}

const getRandomId = (max: number): number => {
    return Math.ceil(Math.random() * max);
}

main()
    .then(async () => {
        console.log("seed successfully made!")
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
