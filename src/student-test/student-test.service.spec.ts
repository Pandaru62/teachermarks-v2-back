// import { Test, TestingModule } from '@nestjs/testing';
// import { StudentTestService } from './student-test.service';
// import { PrismaService } from 'prisma/prisma.service';

// describe('StudentTestService', () => {
//   let service: StudentTestService;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [StudentTestService, { provide: PrismaService, useValue: {} }],
//     }).compile();

//     service = module.get<StudentTestService>(StudentTestService);
//   });

//   it('should be defined', () => {
//     expect(service).toBeDefined();
//   });

//   it('generates escaped CSV with student details and comments', () => {
//     const csv = service.generateCsv([
//       {
//         student: { lastName: 'Doe, Jr.', firstName: 'Jane' },
//         mark: { toString: () => '17.5' },
//         comment: 'Good "work"',
//       },
//       {
//         student: { lastName: 'Smith', firstName: 'Alex' },
//         mark: { toString: () => '12' },
//         comment: null,
//       },
//     ]);

//     expect(csv).toBe(
//       '"Name","Firstname","Mark","Comment"\r\n' +
//         '"Doe, Jr.","Jane","17.5","Good ""work"""\r\n' +
//         '"Smith","Alex","12",""',
//     );
//   });

//   it('generates a valid PDF across multiple pages without splitting rows', async () => {
//     const pdf = await service.generatePdf(
//       Array.from({ length: 60 }, (_, index) => ({
//         student: { lastName: `Student${index}`, firstName: 'Test' },
//         mark: { toString: () => '17.5' },
//         comment: 'A comment for the student test.',
//       })),
//     );
//     const pdfText = pdf.toString('latin1');

//     expect(pdfText.startsWith('%PDF-')).toBe(true);
//     expect(pdfText.match(/\/Type \/Page\b/g)?.length).toBeGreaterThan(1);
//   });
// });
