import { ForbiddenException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateStudentTestDto } from './dto/create-student-test.dto';
import { UpdateStudentTestDto } from './dto/update-student-test.dto';
import { BatchUpdateStudentTestDto } from './dto/batch-update-student-test.dto';
import { PrismaService } from 'prisma/prisma.service';
import { LevelEnum } from 'prisma/generated/enums';
// eslint-disable-next-line @typescript-eslint/no-require-imports
import PDFDocument = require('pdfkit');
import { ErrorCode } from 'src/common/exceptions/error-code.enum';
import { AppException } from 'src/common/exceptions/app.exception';

const selectReturn = {
  id: true,
  mark: true,
  isAbsent: true,
  isUnmarked: true,
  comment: true,
  student: {
    select: {
      id: true,
      lastName: true,
      firstName: true,
    },
  },
  studenttesthasskill: {
    select: {
      skill: {
        select: {
          id: true,
          name: true,
          abbreviation: true,
        },
      },
      level: true,
    },
  },
};

@Injectable()
export class StudentTestService {
  constructor(private readonly prismaService: PrismaService) {}

  async checkIfExists(studentId: number, testId: number, userId: number) {
    return this.prismaService.studenttest.findUnique({
      where: {
        studentTestId: {
          studentId,
          testId,
        },
        student: {
          schoolClasses: {
            some: {
              schoolClass: {
                teachers: {
                  some: {
                    teacher: {
                      userId,
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  create(data: CreateStudentTestDto, studentId: number, testId: number) {
    return this.prismaService.studenttest.create({
      data: {
        mark: data.mark,
        isAbsent: data.isAbsent,
        isUnmarked: data.isUnmarked,
        comment: data.comment,
        student: {
          connect: {
            id: studentId,
          },
        },
        test: {
          connect: {
            id: testId,
          },
        },
        studenttesthasskill: {
          createMany: {
            data: data.skills.map((sk) => ({
              level: sk.level,
              skillId: sk.skillId,
            })),
          },
        },
      },
      select: selectReturn,
    });
  }

  async findAllByStudentId(studentId: number, teacherId: number) {
    return this.prismaService.studenttest.findMany({
      where: {
        studentId,
        student: {
          schoolClasses: {
            some: {
              schoolClass: {
                teachers: {
                  some: {
                    teacher: {
                      userId: teacherId,
                    },
                  },
                },
              },
            },
          },
        },
      },
      select: {
        id: true,
        mark: true,
        isAbsent: true,
        isUnmarked: true,
        comment: true,
        test: {
          select: {
            id: true,
            coefficient: true,
            date: true,
            description: true,
            name: true,
            scale: true,
            trimester: true,
          },
        },
        studenttesthasskill: {
          select: {
            skill: {
              select: {
                id: true,
                name: true,
                abbreviation: true,
              },
            },
            level: true,
          },
        },
      },
      orderBy: {
        test: {
          date: 'desc',
        },
      },
    });
  }

  async findAllByTestId(testId: number, teacherId: number) {
    return this.prismaService.studenttest.findMany({
      where: {
        testId,
        student: {
          schoolClasses: {
            some: {
              schoolClass: {
                teachers: {
                  some: {
                    teacher: {
                      userId: teacherId,
                    },
                  },
                },
              },
            },
          },
        },
      },
      select: {
        ...selectReturn,
        test: {
          select: {
            scale: true,
          },
        },
      },
      orderBy: [
        {
          student: {
            lastName: 'asc',
          },
        },
        {
          student: {
            firstName: 'asc',
          },
        },
      ],
    });
  }

  generateCsv(
    studentTests: Array<{
      student: { lastName: string; firstName: string };
      mark: { toString(): string };
      comment: string | null;
    }>,
  ) {
    const escapeCell = (value: string) => `"${value.replaceAll('"', '""')}"`;
    const rows = [
      ['Name', 'Firstname', 'Mark', 'Comment'],
      ...studentTests.map(({ student, mark, comment }) => [
        student.lastName,
        student.firstName,
        mark.toString(),
        comment ?? '',
      ]),
    ];

    return rows.map((row) => row.map(escapeCell).join(',')).join('\r\n');
  }

  generatePdf(
    studentTests: Array<{
      student: { lastName: string; firstName: string };
      mark: { toString(): string };
      comment: string | null;
      test: { scale: number };
      isAbsent: boolean;
      isUnmarked: boolean;
    }>,
  ): Promise<Buffer> {
    const filteredStudentTests = studentTests.filter(
      ({ isAbsent, isUnmarked }) => !isAbsent && !isUnmarked,
    );

    if (filteredStudentTests.length === 0) {
      throw new AppException(
        ErrorCode.EMPTY_PDF,
        'No student tests to generate PDF',
        HttpStatus.BAD_REQUEST,
      );
    }

    const document = new PDFDocument({
      size: 'A4',
      margin: 18,
    });

    const chunks: Buffer[] = [];

    return new Promise((resolve, reject) => {
      document.on('data', (chunk: Buffer) => chunks.push(chunk));
      document.on('end', () => resolve(Buffer.concat(chunks)));
      document.on('error', reject);

      const margin = 18;
      const horizontalPadding = 6;
      const verticalPadding = 3;

      const minRowHeight = 20;

      const contentWidth =
        document.page.width - margin * 2 - horizontalPadding * 2;

      const bottom = document.page.height - margin;

      let y = margin;

      document.fontSize(10).fillColor('#222222');

      for (const { student, mark, comment, test } of filteredStudentTests) {
        const commentText = comment?.trim() ?? '';

        const heading = `${student.lastName} ${student.firstName} (${mark.toString()} / ${test.scale})`;

        const textOptions = {
          width: contentWidth,
          lineGap: 1,
        };

        document.font('Helvetica-Bold');

        const textHeight = document.heightOfString(
          commentText ? `${heading} - ${commentText}` : heading,
          textOptions,
        );

        const rowHeight = Math.max(
          minRowHeight,
          textHeight + verticalPadding * 2,
        );

        if (y > margin && y + rowHeight > bottom) {
          document.addPage();
          y = margin;
        }

        // Cell border
        document
          .lineWidth(0.5)
          .strokeColor('#b8b8b8')
          .rect(margin, y, document.page.width - margin * 2, rowHeight)
          .stroke();

        const verticalOffset = -1;

        const textY = y + (rowHeight - textHeight) / 2 + verticalOffset;

        if (commentText) {
          document
            .font('Helvetica-Bold')
            .text(heading, margin + horizontalPadding, textY, {
              ...textOptions,
              continued: true,
            })
            .font('Helvetica')
            .text(` - ${commentText}`, textOptions);
        } else {
          document
            .font('Helvetica-Bold')
            .text(heading, margin + horizontalPadding, textY, textOptions);
        }

        y += rowHeight;
      }

      document.end();
    });
  }

  generateGridPdf(
    studentTests: Array<{
      student: { lastName: string; firstName: string };
      mark: { toString(): string };
      comment: string | null;
      test: { scale: number };
      isAbsent: boolean;
      isUnmarked: boolean;
    }>,
  ): Promise<Buffer> {
    const filteredStudentTests = studentTests.filter(
      ({ isAbsent, isUnmarked }) => !isAbsent && !isUnmarked,
    );

    if (filteredStudentTests.length === 0) {
      throw new AppException(
        ErrorCode.EMPTY_PDF,
        'No student tests to generate PDF',
        HttpStatus.BAD_REQUEST,
      );
    }

    const document = new PDFDocument({
      size: 'A4',
      margin: 18,
    });

    const chunks: Buffer[] = [];

    return new Promise((resolve, reject) => {
      document.on('data', (chunk: Buffer) => chunks.push(chunk));
      document.on('end', () => resolve(Buffer.concat(chunks)));
      document.on('error', reject);

      const margin = 18;
      const horizontalPadding = 5;
      const verticalPadding = 3;
      const minCellHeight = 20;
      const columnGap = 8;
      const lineGap = 1;
      const fontSize = 10;

      const pageWidth = document.page.width;
      const pageHeight = document.page.height;

      const columnWidth = (pageWidth - margin * 2 - columnGap) / 2;

      const contentWidth = columnWidth - horizontalPadding * 2;
      const bottom = pageHeight - margin;
      const maxCellHeight = pageHeight - margin * 2;

      type GridItem = {
        heading: string;
        comment: string;
        textHeight: number;
        cellHeight: number;
        originalIndex: number;
      };

      document.fontSize(fontSize).fillColor('#222222');

      // Prepare and measure each cell before printing.
      const items: GridItem[] = filteredStudentTests.map(
        ({ student, mark, comment, test }, originalIndex) => {
          const heading =
            `${student.lastName} ${student.firstName} ` +
            `(${mark.toString()} / ${test.scale})`;

          const commentText = comment?.trim() ?? '';
          const rowText = commentText ? `${heading} - ${commentText}` : heading;

          document.font('Helvetica-Bold');

          const textHeight = document.heightOfString(rowText, {
            width: contentWidth,
            lineGap,
          });

          const cellHeight = Math.max(
            minCellHeight,
            textHeight + verticalPadding * 2,
          );

          return {
            heading,
            comment: commentText,
            textHeight,
            cellHeight,
            originalIndex,
          };
        },
      );

      // Pair cells of similar heights to reduce wasted space.
      // Stable tie-breaker preserves the original order for equal heights.
      items.sort(
        (a, b) =>
          a.cellHeight - b.cellHeight || a.originalIndex - b.originalIndex,
      );

      const rows: GridItem[][] = [];

      for (let i = 0; i < items.length; i += 2) {
        rows.push(items.slice(i, i + 2));
      }

      let y = margin;

      for (const row of rows) {
        const rowHeight = Math.max(...row.map((item) => item.cellHeight));

        // A single row taller than the printable page cannot fit
        // without splitting or changing the layout.
        if (rowHeight > maxCellHeight) {
          reject(
            new Error('An appreciation is too long to fit on a single page.'),
          );
          return;
        }

        // Move the complete row to the next page if necessary.
        if (y + rowHeight > bottom) {
          document.addPage();
          y = margin;
        }

        row.forEach((item, columnIndex) => {
          const x = margin + columnIndex * (columnWidth + columnGap);

          // Cell border
          document
            .lineWidth(0.5)
            .strokeColor('#b8b8b8')
            .rect(x, y, columnWidth, rowHeight)
            .stroke();

          // Vertically center each cell's own text.
          const textY = y + (rowHeight - item.textHeight) / 2 - 1;

          const textOptions = {
            width: contentWidth,
            lineGap,
          };

          if (item.comment) {
            document
              .font('Helvetica-Bold')
              .text(item.heading, x + horizontalPadding, textY, {
                ...textOptions,
                continued: true,
              })
              .font('Helvetica')
              .text(` - ${item.comment}`, textOptions);
          } else {
            document
              .font('Helvetica-Bold')
              .text(item.heading, x + horizontalPadding, textY, textOptions);
          }
        });

        y += rowHeight;
      }

      document.end();
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} studentTest`;
  }

  async update(id: number, updatedStudentTest: UpdateStudentTestDto) {
    const isStudentAbsent = updatedStudentTest.isAbsent;
    const isStudentUnmarked = updatedStudentTest.isUnmarked;

    // 1. Update Skills
    for (const skill of updatedStudentTest.skills) {
      const newInfo = {
        level: isStudentAbsent
          ? LevelEnum.ABS
          : isStudentUnmarked
            ? LevelEnum.NN
            : skill.level,
        skill: {
          connect: {
            id: skill.skillId,
          },
        },
        studenttest: {
          connect: {
            id,
          },
        },
      };

      await this.prismaService.studenttesthasskill.upsert({
        where: {
          studentTestSkillId: {
            skillId: skill.skillId,
            studentTestId: id,
          },
        },
        update: newInfo,
        create: newInfo,
      });
    }

    // 2. Update StudentTest and return it
    return this.prismaService.studenttest.update({
      where: {
        id: id,
      },
      data: {
        isAbsent: updatedStudentTest.isAbsent,
        isUnmarked: updatedStudentTest.isUnmarked,
        mark: updatedStudentTest.mark,
        comment: updatedStudentTest.comment,
      },
      select: selectReturn,
    });
  }

  /*
  |--------------------------------------------------------------------------
  | Batch upsert : met à jour (ou crée, pour les élèves qui n'ont encore
  | aucune ligne pour ce test) plusieurs studenttest en une seule
  | transaction, plutôt qu'un appel par élève.
  |--------------------------------------------------------------------------
  */

  async batchUpsert(
    testId: number,
    teacherId: number,
    payload: BatchUpdateStudentTestDto,
  ) {
    const { studentTests } = payload;

    if (studentTests.length === 0) {
      return [];
    }

    // On vérifie que chaque élève appartient bien à une classe du
    // professeur, comme le font déjà checkIfExists / findAllByTestId /
    // findAllByStudentId, pour ne pas laisser passer un id arbitraire.
    const authorizedStudents = await this.prismaService.student.findMany({
      where: {
        id: { in: studentTests.map((st) => st.studentId) },
        schoolClasses: {
          some: {
            schoolClass: {
              teachers: {
                some: {
                  teacher: {
                    userId: teacherId,
                  },
                },
              },
            },
          },
        },
      },
      select: { id: true },
    });

    const authorizedStudentIds = new Set(
      authorizedStudents.map((student) => student.id),
    );

    const unauthorizedEntry = studentTests.find(
      (st) => !authorizedStudentIds.has(st.studentId),
    );

    if (unauthorizedEntry) {
      throw new ForbiddenException(
        `L'élève #${unauthorizedEntry.studentId} n'appartient à aucune de vos classes.`,
      );
    }

    return this.prismaService.$transaction(async (tx) => {
      const studentTestIds: number[] = [];

      for (const item of studentTests) {
        const { studentId, mark, isAbsent, isUnmarked, comment, skills } = item;

        // 1. Upsert du studenttest lui-même (certains élèves n'ont
        //    encore aucune ligne pour ce test).
        const studentTest = await tx.studenttest.upsert({
          where: {
            studentTestId: {
              studentId,
              testId,
            },
          },
          create: {
            mark,
            isAbsent,
            isUnmarked,
            comment,
            student: { connect: { id: studentId } },
            test: { connect: { id: testId } },
          },
          update: {
            mark,
            isAbsent,
            isUnmarked,
            comment,
          },
        });

        // 2. Upsert de chaque compétence, avec la même règle que
        //    update() : absent/non noté écrase le niveau saisi.
        for (const skill of skills) {
          const level = isAbsent
            ? LevelEnum.ABS
            : isUnmarked
              ? LevelEnum.NN
              : skill.level;

          const skillInfo = {
            level,
            skill: { connect: { id: skill.skillId } },
            studenttest: { connect: { id: studentTest.id } },
          };

          await tx.studenttesthasskill.upsert({
            where: {
              studentTestSkillId: {
                skillId: skill.skillId,
                studentTestId: studentTest.id,
              },
            },
            update: skillInfo,
            create: skillInfo,
          });
        }

        studentTestIds.push(studentTest.id);
      }

      // On renvoie les lignes à jour, dans le même format que
      // findAllByTestId, pour que le front puisse simplement
      // remplacer les entrées modifiées dans son cache.
      return tx.studenttest.findMany({
        where: { id: { in: studentTestIds } },
        select: selectReturn,
      });
    });
  }

  remove(id: number) {
    return `This action removes a #${id} studentTest`;
  }
}
