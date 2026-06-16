package model;

/**
 * 初回アンケートのデータモデル
 * 5DIET – SurveyData.java
 */
public class SurveyData {

    // ---------- 基本情報 ----------
    private String gender;       // "male" | "female"
    private int    age;          // 歳
    private double height;       // cm（小数第1位まで）
    private double weight;       // kg
    private double bmi;          // 自動計算
    private double goalWeight;   // kg

    // ---------- 目標設定 ----------
    private String goalDate;     // "YYYY-MM-DD"
    private int    remainDays;   // 残り日数（自動計算）
    private String purpose;      // ダイエットの目的
    private String purposeOther; // 「その他」詳細（nullable）

    // ---------- 生活スタイル ----------
    private String activityLevel; // sedentary / light / moderate / active / very_active
    private String jobType;       // desk / standing / physical / mixed / none

    // ---------- 食事情報 ----------
    private String dietExp;      // none / little / moderate / experienced
    private String mealStyle;    // japanese / western / mixed / vegetarian / other
    private String allergy;      // nullable

    /* ============================================================
       コンストラクタ
       ============================================================ */
    public SurveyData() {}

    public SurveyData(String gender, int age, double height, double weight,
                      double goalWeight, String goalDate, int remainDays,
                      String purpose, String purposeOther,
                      String activityLevel, String jobType,
                      String dietExp, String mealStyle, String allergy) {

        this.gender        = gender;
        this.age           = age;
        this.height        = height;
        this.weight        = weight;
        this.bmi           = calcBMI(weight, height);
        this.goalWeight    = goalWeight;
        this.goalDate      = goalDate;
        this.remainDays    = remainDays;
        this.purpose       = purpose;
        this.purposeOther  = purposeOther;
        this.activityLevel = activityLevel;
        this.jobType       = jobType;
        this.dietExp       = dietExp;
        this.mealStyle     = mealStyle;
        this.allergy       = allergy;
    }

    /* ============================================================
       BMI 計算
       BMI = 体重(kg) ÷ 身長(m)^2
       ============================================================ */
    public static double calcBMI(double weightKg, double heightCm) {
        if (heightCm <= 0 || weightKg <= 0) return 0;
        double heightM = heightCm / 100.0;
        return Math.round((weightKg / (heightM * heightM)) * 10.0) / 10.0;
    }

    /* ============================================================
       BMI 判定ラベル
       ============================================================ */
    public String getBMICategory() {
        if (bmi < 18.5) return "低体重";
        if (bmi < 25.0) return "標準";
        if (bmi < 30.0) return "肥満（1度）";
        if (bmi < 35.0) return "肥満（2度）";
        return "肥満（3度）";
    }

    /* ============================================================
       Getters / Setters
       ============================================================ */
    public String getGender()                  { return gender; }
    public void   setGender(String gender)     { this.gender = gender; }

    public int    getAge()                     { return age; }
    public void   setAge(int age)              { this.age = age; }

    public double getHeight()                  { return height; }
    public void   setHeight(double height)     { this.height = height; }

    public double getWeight()                  { return weight; }
    public void   setWeight(double weight) {
        this.weight = weight;
        this.bmi    = calcBMI(weight, this.height);
    }

    public double getBmi()                     { return bmi; }
    public void   setBmi(double bmi)           { this.bmi = bmi; }

    public double getGoalWeight()              { return goalWeight; }
    public void   setGoalWeight(double gw)     { this.goalWeight = gw; }

    public String getGoalDate()                { return goalDate; }
    public void   setGoalDate(String goalDate) { this.goalDate = goalDate; }

    public int    getRemainDays()              { return remainDays; }
    public void   setRemainDays(int days)      { this.remainDays = days; }

    public String getPurpose()                 { return purpose; }
    public void   setPurpose(String purpose)   { this.purpose = purpose; }

    public String getPurposeOther()            { return purposeOther; }
    public void   setPurposeOther(String po)   { this.purposeOther = po; }

    public String getActivityLevel()           { return activityLevel; }
    public void   setActivityLevel(String al)  { this.activityLevel = al; }

    public String getJobType()                 { return jobType; }
    public void   setJobType(String jobType)   { this.jobType = jobType; }

    public String getDietExp()                 { return dietExp; }
    public void   setDietExp(String dietExp)   { this.dietExp = dietExp; }

    public String getMealStyle()               { return mealStyle; }
    public void   setMealStyle(String ms)      { this.mealStyle = ms; }

    public String getAllergy()                 { return allergy; }
    public void   setAllergy(String allergy)   { this.allergy = allergy; }

    @Override
    public String toString() {
        return "SurveyData{" +
               "gender='"        + gender        + '\'' +
               ", age="          + age           +
               ", height="       + height        +
               ", weight="       + weight        +
               ", bmi="          + bmi           +
               ", goalWeight="   + goalWeight    +
               ", goalDate='"    + goalDate      + '\'' +
               ", remainDays="   + remainDays    +
               ", purpose='"     + purpose       + '\'' +
               ", purposeOther='"+ purposeOther  + '\'' +
               ", activityLevel='"+ activityLevel+ '\'' +
               ", jobType='"     + jobType       + '\'' +
               ", dietExp='"     + dietExp       + '\'' +
               ", mealStyle='"   + mealStyle     + '\'' +
               ", allergy='"     + allergy       + '\'' +
               '}';
    }
}
