package com.example.demo.entity;

public class SurveyData {
    private int userId;
    private String gender;
    private int age;
    private double height;
    private double weight;
    private double bmi;
    private double goalWeight;
    private String goalDate;
    private int remainDays;
    private String purpose;
    private String purposeOther;
    private String activityLevel;
    private String jobType;
    private String dietExp;
    private String mealStyle;
    private String allergy;

    public static double calcBMI(double weight, double heightCm) {
        if (heightCm <= 0) return 0;
        double heightM = heightCm / 100.0;
        return weight / (heightM * heightM);
    }

    // Getters and Setters
    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    public int getAge() { return age; }
    public void setAge(int age) { this.age = age; }
    public double getHeight() { return height; }
    public void setHeight(double height) { this.height = height; }
    public double getWeight() { return weight; }
    public void setWeight(double weight) { this.weight = weight; }
    public double getBmi() { return bmi; }
    public void setBmi(double bmi) { this.bmi = bmi; }
    public double getGoalWeight() { return goalWeight; }
    public void setGoalWeight(double goalWeight) { this.goalWeight = goalWeight; }
    public String getGoalDate() { return goalDate; }
    public void setGoalDate(String goalDate) { this.goalDate = goalDate; }
    public int getRemainDays() { return remainDays; }
    public void setRemainDays(int remainDays) { this.remainDays = remainDays; }
    public String getPurpose() { return purpose; }
    public void setPurpose(String purpose) { this.purpose = purpose; }
    public String getPurposeOther() { return purposeOther; }
    public void setPurposeOther(String purposeOther) { this.purposeOther = purposeOther; }
    public String getActivityLevel() { return activityLevel; }
    public void setActivityLevel(String activityLevel) { this.activityLevel = activityLevel; }
    public String getJobType() { return jobType; }
    public void setJobType(String jobType) { this.jobType = jobType; }
    public String getDietExp() { return dietExp; }
    public void setDietExp(String dietExp) { this.dietExp = dietExp; }
    public String getMealStyle() { return mealStyle; }
    public void setMealStyle(String mealStyle) { this.mealStyle = mealStyle; }
    public String getAllergy() { return allergy; }
    public void setAllergy(String allergy) { this.allergy = allergy; }
}