// タイムゾーンを考慮した日付処理ユーティリティ

/**
 * 日本時間（JST）で日付文字列を取得
 * @param date Dateオブジェクト
 * @returns YYYY-MM-DD形式の日付文字列（JST）
 */
export const getJSTDateString = (date: Date): string => {
  // 日本時間のオフセット（+9時間）
  const jstOffset = 9 * 60 * 60 * 1000;
  
  // ローカル時間をJSTに変換
  const jstDate = new Date(date.getTime() + jstOffset);
  
  // YYYY-MM-DD形式で返す
  return jstDate.toISOString().split('T')[0];
};

/**
 * 現在の日本時間の日付文字列を取得
 * @returns YYYY-MM-DD形式の日付文字列（JST）
 */
export const getCurrentJSTDateString = (): string => {
  return getJSTDateString(new Date());
};

/**
 * 日付文字列を日本時間のDateオブジェクトに変換
 * @param dateString YYYY-MM-DD形式の日付文字列
 * @returns Dateオブジェクト（JST）
 */
export const parseJSTDate = (dateString: string): Date => {
  // 日付文字列に00:00:00を追加してJSTとして解析
  const jstDateTime = `${dateString}T00:00:00+09:00`;
  return new Date(jstDateTime);
};

/**
 * 月の開始日と終了日を日本時間で取得
 * @param date 基準となる日付
 * @returns {start: string, end: string} 月の開始日と終了日（YYYY-MM-DD形式）
 */
export const getMonthDateRange = (date: Date): { start: string; end: string } => {
  const year = date.getFullYear();
  const month = date.getMonth();
  
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);
  
  return {
    start: getJSTDateString(startDate),
    end: getJSTDateString(endDate)
  };
};

/**
 * 日付を日本語形式でフォーマット
 * @param date Dateオブジェクト
 * @returns 日本語形式の日付文字列（例: 2024年1月15日（月））
 */
export const formatDateJapanese = (date: Date): string => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
  
  return `${year}年${month}月${day}日（${dayOfWeek}）`;
}; 