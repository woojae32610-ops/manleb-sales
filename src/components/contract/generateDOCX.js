/**
 * DOCX 생성 — docx 라이브러리 기반
 */
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  HeadingLevel,
  TabStopPosition,
  TabStopType,
} from 'docx';
import { saveAs } from 'file-saver';
import { CONTRACT_TEMPLATES } from './contractTemplates.js';

const FONT = 'Malgun Gothic';
const FONT_SIZE = 20; // half-points → 10pt
const HEADING_SIZE = 24; // 12pt
const TITLE_SIZE = 32; // 16pt

function makeTitle(title, subtitle) {
  const runs = [
    new TextRun({
      text: title,
      bold: true,
      size: TITLE_SIZE,
      font: FONT,
    }),
  ];
  if (subtitle) {
    runs.push(
      new TextRun({
        text: ` ${subtitle}`,
        size: HEADING_SIZE,
        font: FONT,
        color: '666666',
      })
    );
  }
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 400 },
    children: runs,
  });
}

function makeHeading(text) {
  return new Paragraph({
    spacing: { before: 300, after: 100 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: HEADING_SIZE,
        font: FONT,
      }),
    ],
  });
}

function makeBody(text) {
  // 줄바꿈 처리
  const lines = text.split('\n');
  const runs = [];
  lines.forEach((line, i) => {
    if (i > 0) runs.push(new TextRun({ break: 1, font: FONT, size: FONT_SIZE }));
    runs.push(new TextRun({ text: line, font: FONT, size: FONT_SIZE }));
  });
  return new Paragraph({
    spacing: { after: 100 },
    indent: { left: 200 },
    children: runs,
  });
}

function makeEmptyLine() {
  return new Paragraph({ spacing: { after: 200 }, children: [] });
}

function makeSignatureBlock(data) {
  const labels = data.contractType === 'freelancer'
    ? { employer: '위탁자 (갑)', employee: '수탁자 (을)' }
    : { employer: '사업주 (갑)', employee: '근로자 (을)' };

  const today = data.createdAt || '';

  return [
    makeEmptyLine(),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 400 },
      children: [
        new TextRun({ text: today, font: FONT, size: FONT_SIZE }),
      ],
    }),
    makeEmptyLine(),
    // 사업주
    new Paragraph({
      spacing: { before: 200 },
      children: [
        new TextRun({ text: `${labels.employer}`, bold: true, font: FONT, size: FONT_SIZE }),
      ],
    }),
    new Paragraph({
      indent: { left: 400 },
      children: [
        new TextRun({ text: `사업체명: ${data.storeName || '                    '}`, font: FONT, size: FONT_SIZE }),
      ],
    }),
    new Paragraph({
      indent: { left: 400 },
      children: [
        new TextRun({ text: `대 표 자: ${data.ownerName || '                    '}    (서명 또는 인)`, font: FONT, size: FONT_SIZE }),
      ],
    }),
    new Paragraph({
      indent: { left: 400 },
      children: [
        new TextRun({ text: `주    소: ${data.storeAddress || '                    '}`, font: FONT, size: FONT_SIZE }),
      ],
    }),
    new Paragraph({
      indent: { left: 400 },
      children: [
        new TextRun({ text: `사업자번호: ${data.businessNumber || '                    '}`, font: FONT, size: FONT_SIZE }),
      ],
    }),
    makeEmptyLine(),
    // 근로자
    new Paragraph({
      children: [
        new TextRun({ text: `${labels.employee}`, bold: true, font: FONT, size: FONT_SIZE }),
      ],
    }),
    new Paragraph({
      indent: { left: 400 },
      children: [
        new TextRun({ text: `성    명: ${data.employeeName || '                    '}    (서명 또는 인)`, font: FONT, size: FONT_SIZE }),
      ],
    }),
    new Paragraph({
      indent: { left: 400 },
      children: [
        new TextRun({ text: `주    소:                                        `, font: FONT, size: FONT_SIZE }),
      ],
    }),
    new Paragraph({
      indent: { left: 400 },
      children: [
        new TextRun({ text: `연 락 처:                                        `, font: FONT, size: FONT_SIZE }),
      ],
    }),
  ];
}

function makeScheduleTable(schedule) {
  const headerRow = new TableRow({
    children: ['요일', '시업', '종업', '휴게', '근로시간'].map(text =>
      new TableCell({
        width: { size: 20, type: WidthType.PERCENTAGE },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text, bold: true, font: FONT, size: 18 })],
          }),
        ],
      })
    ),
  });

  const dataRows = schedule.map(s =>
    new TableRow({
      children: [
        s.day,
        s.isWork ? s.startTime : '-',
        s.isWork ? s.endTime : '-',
        s.isWork ? `${s.breakHours}h` : '-',
        s.isWork ? `${s.hours}h` : '-',
      ].map(text =>
        new TableCell({
          width: { size: 20, type: WidthType.PERCENTAGE },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: String(text), font: FONT, size: 18 })],
            }),
          ],
        })
      ),
    })
  );

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...dataRows],
  });
}

export async function generateDOCX(contractData) {
  const templateKey = contractData.contractType;
  const template = CONTRACT_TEMPLATES[templateKey];
  if (!template) throw new Error(`Unknown contract type: ${templateKey}`);

  const children = [];

  // 제목
  children.push(makeTitle(template.title, template.subtitle));
  children.push(makeEmptyLine());

  // 섹션들
  template.sections.forEach(section => {
    children.push(makeHeading(section.heading));
    const content = section.content(contractData);
    children.push(makeBody(content));
  });

  // 스케줄 테이블 (단시간/초단시간)
  if (template.hasScheduleTable && contractData.schedule?.length > 0) {
    children.push(makeEmptyLine());
    children.push(makeHeading('[별첨] 근로일별 근로시간'));
    children.push(makeScheduleTable(contractData.schedule));
  }

  // 서명란
  if (template.signature) {
    children.push(...makeSignatureBlock(contractData));
  }

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: {
            top: 1440,    // 1 inch
            right: 1440,
            bottom: 1440,
            left: 1440,
          },
        },
      },
      children,
    }],
  });

  const blob = await Packer.toBlob(doc);
  const fileName = `${contractData.contractTypeLabel}_${contractData.employeeName || '빈양식'}_${new Date().toISOString().split('T')[0]}.docx`;
  saveAs(blob, fileName);
}
