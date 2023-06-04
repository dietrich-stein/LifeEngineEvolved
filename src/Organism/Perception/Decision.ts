abstract class Decision {
  public static neutral: number = 0;
  public static retreat: number = 1;
  public static chase: number = 2;
  public static getRandom(): number {
    return Math.floor(Math.random() * 3);
  }
  public static getRandomNonNeutral(): number {
    return Math.floor(Math.random() * 2) + 1;
  }
}

export default Decision;
