/**
 * NanumGothic 폰트 Base64 데이터 플레이스홀더
 *
 * 실제 사용 시 NanumGothic.ttf 파일을 Base64로 변환하여 아래에 붙여넣기:
 *
 * 변환 방법 (Node.js):
 *   const fs = require('fs');
 *   const font = fs.readFileSync('NanumGothic.ttf');
 *   const base64 = font.toString('base64');
 *   fs.writeFileSync('NanumGothic-normal.js', `export default "${base64}";`);
 *
 * 또는 https://rawgit.com/nicoleahmed/jsPDF-Korean/master/ 참고
 *
 * 이 파일이 비어있으면 PDF에서 한글이 깨질 수 있습니다.
 * DOCX 출력은 시스템 폰트를 사용하므로 영향 없습니다.
 */
export default null;
export const NanumGothicNormal = null;
