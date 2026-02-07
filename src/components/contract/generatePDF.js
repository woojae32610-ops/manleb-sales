/**
 * PDF 생성 — jsPDF 기반
 * 한글 폰트: NanumGothic Base64 (dynamic import)
 */
import { jsPDF } from 'jspdf';
import { CONTRACT_TEMPLATES } from './contractTemplates.js';

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN = 20;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const LINE_HEIGHT = 6;
const FONT_SIZE_TITLE = 18;
const FONT_SIZE_HEADING = 12;
const FONT_SIZE_BODY = 10;

let fontLoaded = false;

async function loadKoreanFont(doc) {
  if (fontLoaded) {
    doc.setFont('NanumGothic', 'normal');
    return;
  }

  try {
    // NanumGothic 폰트 동적 로딩
    const fontModule = await import('../../assets/fonts/NanumGothic-normal.js');
    const fontData = fontModule.default || fontModule.NanumGothicNormal;
    if (fontData) {
      doc.addFileToVFS('NanumGothic-normal.ttf', fontData);
      doc.addFont('NanumGothic-normal.ttf', 'NanumGothic', 'normal');
      doc.setFont('NanumGothic', 'normal');
      fontLoaded = true;
    } else {
      throw new Error('Font data not found');
    }
  } catch (e) {
    // 폰트 로딩 실패 시 기본 폰트 사용 (한글 깨질 수 있음)
    console.warn('한글 폰트 로딩 실패, 기본 폰트 사용:', e.message);
    // jsPDF 내장 한글 지원 시도
    doc.setFont('helvetica', 'normal');
  }
}

function checkPageBreak(doc, y, needed = LINE_HEIGHT * 2) {
  if (y + needed > PAGE_HEIGHT - MARGIN) {
    doc.addPage();
    return MARGIN;
  }
  return y;
}

function wrapText(doc, text, maxWidth) {
  // jsPDF splitTextToSize 사용
  return doc.splitTextToSize(text, maxWidth);
}

function drawTitle(doc, title, subtitle, y) {
  doc.setFontSize(FONT_SIZE_TITLE);
  const titleWidth = doc.getTextWidth(title);
  const x = (PAGE_WIDTH - titleWidth) / 2;
  doc.text(title, x, y);
  y += LINE_HEIGHT * 1.5;

  if (subtitle) {
    doc.setFontSize(FONT_SIZE_BODY);
    doc.setTextColor(100);
    const subWidth = doc.getTextWidth(subtitle);
    doc.text(subtitle, (PAGE_WIDTH - subWidth) / 2, y);
    doc.setTextColor(0);
    y += LINE_HEIGHT;
  }
  return y + LINE_HEIGHT;
}

function drawHeading(doc, text, y) {
  y = checkPageBreak(doc, y, LINE_HEIGHT * 3);
  doc.setFontSize(FONT_SIZE_HEADING);
  doc.text(text, MARGIN, y);
  y += LINE_HEIGHT * 1.2;
  return y;
}

function drawBody(doc, text, y) {
  doc.setFontSize(FONT_SIZE_BODY);
  const lines = text.split('\n');
  for (const line of lines) {
    const wrapped = wrapText(doc, line, CONTENT_WIDTH - 10);
    for (const wl of wrapped) {
      y = checkPageBreak(doc, y);
      doc.text(wl, MARGIN + 5, y);
      y += LINE_HEIGHT;
    }
  }
  y += LINE_HEIGHT * 0.3;
  return y;
}

function drawScheduleTable(doc, schedule, y) {
  y = checkPageBreak(doc, y, LINE_HEIGHT * 10);

  const colWidths = [25, 35, 35, 30, 35];
  const headers = ['요일', '시업', '종업', '휴게', '근로시간'];
  const startX = MARGIN;

  doc.setFontSize(9);

  // 헤더
  doc.setFillColor(240, 240, 240);
  doc.rect(startX, y - 4, CONTENT_WIDTH, LINE_HEIGHT + 2, 'F');
  doc.setTextColor(0);
  let x = startX;
  headers.forEach((h, i) => {
    doc.text(h, x + colWidths[i] / 2, y, { align: 'center' });
    x += colWidths[i];
  });
  y += LINE_HEIGHT + 1;

  // 데이터
  schedule.forEach(s => {
    y = checkPageBreak(doc, y);
    x = startX;
    const row = [
      s.day,
      s.isWork ? s.startTime : '-',
      s.isWork ? s.endTime : '-',
      s.isWork ? `${s.breakHours}h` : '-',
      s.isWork ? `${s.hours}h` : '-',
    ];

    // 라인
    doc.setDrawColor(200);
    doc.line(startX, y + 1, startX + CONTENT_WIDTH, y + 1);

    if (!s.isWork) doc.setTextColor(180);
    else doc.setTextColor(0);

    row.forEach((cell, i) => {
      doc.text(String(cell), x + colWidths[i] / 2, y, { align: 'center' });
      x += colWidths[i];
    });
    y += LINE_HEIGHT;
  });

  doc.setTextColor(0);
  doc.line(startX, y + 1, startX + CONTENT_WIDTH, y + 1);
  return y + LINE_HEIGHT;
}

function drawSignatureBlock(doc, data, y) {
  y = checkPageBreak(doc, y, LINE_HEIGHT * 15);

  const labels = data.contractType === 'freelancer'
    ? { employer: '위탁자 (갑)', employee: '수탁자 (을)' }
    : { employer: '사업주 (갑)', employee: '근로자 (을)' };

  doc.setFontSize(FONT_SIZE_BODY);

  // 날짜
  y += LINE_HEIGHT;
  const dateText = data.createdAt || '';
  const dateWidth = doc.getTextWidth(dateText);
  doc.text(dateText, (PAGE_WIDTH - dateWidth) / 2, y);
  y += LINE_HEIGHT * 2;

  // 사업주
  doc.setFontSize(FONT_SIZE_HEADING);
  doc.text(labels.employer, MARGIN, y);
  y += LINE_HEIGHT * 1.2;
  doc.setFontSize(FONT_SIZE_BODY);
  doc.text(`사업체명: ${data.storeName || '                    '}`, MARGIN + 10, y); y += LINE_HEIGHT;
  doc.text(`대 표 자: ${data.ownerName || '                    '}    (서명 또는 인)`, MARGIN + 10, y); y += LINE_HEIGHT;
  doc.text(`주    소: ${data.storeAddress || '                    '}`, MARGIN + 10, y); y += LINE_HEIGHT;
  doc.text(`사업자번호: ${data.businessNumber || '                    '}`, MARGIN + 10, y); y += LINE_HEIGHT;
  y += LINE_HEIGHT;

  // 근로자
  y = checkPageBreak(doc, y, LINE_HEIGHT * 6);
  doc.setFontSize(FONT_SIZE_HEADING);
  doc.text(labels.employee, MARGIN, y);
  y += LINE_HEIGHT * 1.2;
  doc.setFontSize(FONT_SIZE_BODY);
  doc.text(`성    명: ${data.employeeName || '                    '}    (서명 또는 인)`, MARGIN + 10, y); y += LINE_HEIGHT;
  doc.text(`주    소:                                        `, MARGIN + 10, y); y += LINE_HEIGHT;
  doc.text(`연 락 처:                                        `, MARGIN + 10, y); y += LINE_HEIGHT;

  return y;
}

export async function generatePDF(contractData) {
  const templateKey = contractData.contractType;
  const template = CONTRACT_TEMPLATES[templateKey];
  if (!template) throw new Error(`Unknown contract type: ${templateKey}`);

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // 한글 폰트 로딩
  await loadKoreanFont(doc);

  let y = MARGIN;

  // 제목
  y = drawTitle(doc, template.title, template.subtitle, y + 10);

  // 섹션들
  template.sections.forEach(section => {
    y = drawHeading(doc, section.heading, y);
    const content = section.content(contractData);
    y = drawBody(doc, content, y);
  });

  // 스케줄 테이블
  if (template.hasScheduleTable && contractData.schedule?.length > 0) {
    y += LINE_HEIGHT;
    y = drawHeading(doc, '[별첨] 근로일별 근로시간', y);
    y = drawScheduleTable(doc, contractData.schedule, y);
  }

  // 서명란
  if (template.signature) {
    y = drawSignatureBlock(doc, contractData, y);
  }

  const fileName = `${contractData.contractTypeLabel}_${contractData.employeeName || '빈양식'}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
