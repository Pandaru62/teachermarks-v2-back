import { form, LevelEnum, PrismaClient, schoolclass, skill, student, StudentHasSchoolClass, studenttest, studenttesthasskill, test, testhasskill, TrimesterEnum, user, UserRoleEnum } from '@prisma/client'
import { fakerFR as faker } from '@faker-js/faker';
import * as argon2 from 'argon2';

const prisma = new PrismaClient()
async function main() {
    const users = await createUsersAndProfiles(2);
    const forms = await createForms();
    const skills = await createSkills();
    const schoolClasses = await createSchoolClasses(8, forms);
    await createUserHasSchoolClasses(users, schoolClasses);
    const students = await createStudents(50);
    const studentsHaveSchoolClass = await createStudentsHaveClasses(students, schoolClasses);
    const tests = await createTests(10, schoolClasses);
    const testHasSkill = await createTestHasSkills(3, tests, skills);
    const studentTests = await createStudentTests(students, studentsHaveSchoolClass, tests);
    await createStudentTestHasSkill(studentTests, testHasSkill);
}

const createUsersAndProfiles = async (number: number): Promise<user[]> => {
    const users = []
    while (number) {
        const password = await argon2.hash('Abcdef,123');
        users.push(await prisma.user.create({
            data: {
                email: faker.internet.email(),
                password: password,
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
        const randomId = getRandomId(forms.length);        
        const randomForm = forms.find((form) => form.id === randomId)
        schoolClasses.push(await prisma.schoolclass.create({
            data: {
                name: randomForm.name + getRandomNumber(9),
                color: faker.color.rgb(),
                form: {
                    connect: {
                        id: randomForm.id
                    }
                }
            }
        }));
        number--
    }
    return schoolClasses;
}

const createUserHasSchoolClasses = async (users: user[], schoolClasses: schoolclass[]) => {
    if (schoolClasses.length === 0) return;

    const data = schoolClasses.map(schoolClass => ({
        schoolClassId: schoolClass.id,
        userId: users[Math.floor(Math.random() * users.length)].id
    }));

    await prisma.userHasSchoolClass.createMany({ data });
};




const createStudents = async (number: number): Promise<student[]> => {
    const students = []
    while (number) {
        students.push(await prisma.student.create({
            data: {
                firstName: faker.person.firstName(),
                lastName: faker.person.lastName(),
            }
        }));
        number--
    }
    return students;
}

const createStudentsHaveClasses = async (students: student[], schoolClasses: schoolclass[]): Promise<StudentHasSchoolClass[]> => {
    const studentsHaveClasses = [];
    for (const student of students) {
        studentsHaveClasses.push(await prisma.studentHasSchoolClass.create({
            data: {
                student: {
                    connect: {
                        id: student.id
                    }
                },
                schoolClass: {
                    connect: {
                        id: getRandomId(schoolClasses.length)
                    }
                }
            }
        }))
    }

    return studentsHaveClasses;
};

const createTests = async (number: number, schoolClasses: schoolclass[]): Promise<test[]> => {
    const tests = []
    while (number) {
        tests.push(await prisma.test.create({
            data: {
                date: faker.date.recent(),
                name: faker.lorem.word(10),
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

const createTestHasSkills = async (
  number: number,
  tests: test[],
  skills: skill[]
): Promise<testhasskill[]> => {
  const testshasskills = [];

  for (const test of tests) {
    for (let i = 0; i < number; i++) {
      const skillId = getRandomId(skills.length);
      testshasskills.push(
        await prisma.testhasskill.upsert({
          create: {
            skillId,
            testId: test.id,
          },
          update: {},
          where: {
            testId_skillId: {
              skillId,
              testId: test.id,
            },
          },
        })
      );
    }
  }

  return testshasskills;
};


// TEST ??
const createStudentTests = async (students: student[], studentsHaveClasses: StudentHasSchoolClass[], tests: test[]): Promise<studenttest[]> => {
    const studentsTests = []
    
    // 1. Prendre chaque élève
    for (const student of students) {
        // 2. Pour chaque élève récupérer les IDs des tests de sa classe et créer une entrée pour chaque
        const studentClass = studentsHaveClasses.find((shc) => shc.studentId === student.id).schoolClassId;
        const studentTests = tests.filter((test) => test.schoolClassId === studentClass);

        for (const studentTest of studentTests) {
            studentsTests.push(await prisma.studenttest.create({
                data: {
                    mark: getRandomNumber(20),
                    student: {
                        connect: {
                            id: student.id
                        }
                    },
                    test: {
                        connect: {
                            id: studentTest.id
                        }
                    }
                }
            }))
        }

    }
    
    return studentsTests;
}

const createStudentTestHasSkill = async (studentTests: studenttest[], testhasskill : testhasskill[]): Promise<studenttesthasskill[]> => {
    const studentTestHasSkill = []
    
    // Prendre chaque StudentTest
    for (const studentTest of studentTests) {
        // Prendre les TestHasSkill pour chaque studentTest.testId
        const assessedSkills = testhasskill.filter((ths) => ths.testId === studentTest.testId);
        for (const assessedSkill of assessedSkills) {
            // Insert a new record for studenttesthasskill
            studentTestHasSkill.push(await prisma.studenttesthasskill.upsert({
                where: {
                    studentTestSkillId: {
                        skillId: assessedSkill.skillId,
                        studentTestId: studentTest.id
                    }
                },
                update: {},
                create: {
                    level: faker.helpers.enumValue(LevelEnum), 
                    skill: {
                        connect: { id: assessedSkill.skillId }
                    },
                    studenttest: {
                        connect: { id: studentTest.id }
                    }
                }
            }));

        }


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
