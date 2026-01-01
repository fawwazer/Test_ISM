const {
  User,
  Category,
  Criteria,
  ScoreOption,
  Application,
  ApplicationScore,
} = require("../models");
const { comparePassword } = require("../helpers/bcrypt");
const { signToken } = require("../helpers/jwt");

class Controller {
  static async register(req, res, next) {
    try {
      const {
        nama,
        tempatLahir,
        tanggalLahir,
        jenisKelamin,
        kodePos,
        alamat,
        email,
        password,
        role,
      } = req.body;

      // Only allow 'user' role for public registration
      if (role && role !== "user") {
        return res.status(403).json({
          message:
            "Cannot register as officer or admin. Please contact system administrator.",
        });
      }

      if (
        !nama ||
        !tempatLahir ||
        !tanggalLahir ||
        !jenisKelamin ||
        !kodePos ||
        !alamat ||
        !email ||
        !password
      ) {
        return res.status(400).json({ message: "All fields are required" });
      }

      if (jenisKelamin !== "L" && jenisKelamin !== "P") {
        return res.status(400).json({
          message: "Jenis kelamin must be 'Laki-laki' atau 'Perempuan'",
        });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const user = await User.create({
        nama,
        tempatLahir,
        tanggalLahir,
        jenisKelamin,
        kodePos,
        alamat,
        email,
        password,
        role: "user", // Force role to 'user'
      });

      res.status(201).json({
        message: "User registered successfully",
        data: {
          id: user.id,
          nama: user.nama,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Email and password are required" });
      }

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const isPasswordValid = comparePassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const token = signToken({ id: user.id, role: user.role });

      res.status(200).json({
        message: "Login successful",
        access_token: token,
        data: {
          id: user.id,
          nama: user.nama,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getScoringStructure(req, res, next) {
    try {
      const categories = await Category.findAll({
        include: [
          {
            model: Criteria,
            as: "criteria",
            include: [{ model: ScoreOption, as: "scoreOptions" }],
          },
        ],
        order: [
          ["order", "ASC"],
          [{ model: Criteria, as: "criteria" }, "order", "ASC"],
          [
            { model: Criteria, as: "criteria" },
            { model: ScoreOption, as: "scoreOptions" },
            "order",
            "ASC",
          ],
        ],
      });
      res.status(200).json({ data: categories });
    } catch (error) {
      next(error);
    }
  }

  // User submits draft application (INFORMASI 1-3 only)
  static async submitApplicationDraft(req, res, next) {
    try {
      const { scores } = req.body; // criteria 1-11 (INFORMASI 1-3)
      const userId = req.user.id;

      if (!scores || !Array.isArray(scores) || scores.length === 0) {
        return res.status(400).json({ message: "Scores data required" });
      }

      // Validate only INFORMASI 1-3 criteria (id 1-11)
      const validCriteriaIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
      const invalidCriteria = scores.find(
        (s) => !validCriteriaIds.includes(s.criteriaId)
      );

      if (invalidCriteria) {
        return res.status(400).json({
          message:
            "Only INFORMASI 1-3 criteria allowed for user application (criteria 1-11)",
        });
      }

      const appNumber = `APP-${Date.now()}-${userId}`;
      const user = await User.findByPk(userId);

      const application = await Application.create({
        applicationNumber: appNumber,
        userId,
        applicantName: user.nama,
        status: "draft",
      });

      // Save user's answers
      for (const item of scores) {
        const { criteriaId, scoreOptionId } = item;
        const criteria = await Criteria.findByPk(criteriaId);
        const scoreOption = await ScoreOption.findByPk(scoreOptionId);

        if (!criteria || !scoreOption) {
          continue;
        }

        const weightedScore = (scoreOption.score * criteria.weight) / 100;

        await ApplicationScore.create({
          applicationId: application.id,
          criteriaId,
          scoreOptionId,
          score: scoreOption.score,
          criteriaWeight: criteria.weight,
          weightedScore,
        });
      }

      res.status(201).json({
        message: "Draft application submitted, waiting for officer assessment",
        data: {
          applicationNumber: appNumber,
          status: "draft",
          applicationId: application.id,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Officer completes assessment (INFORMASI 4-6)
  static async completeAssessment(req, res, next) {
    try {
      const { id } = req.params; // application ID
      const { scores } = req.body; // criteria 12-22 (INFORMASI 4-6)

      if (!scores || !Array.isArray(scores) || scores.length === 0) {
        return res.status(400).json({ message: "Scores data required" });
      }

      // Validate only INFORMASI 4-6 criteria (id 12-22)
      const validCriteriaIds = [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];
      const invalidCriteria = scores.find(
        (s) => !validCriteriaIds.includes(s.criteriaId)
      );

      if (invalidCriteria) {
        return res.status(400).json({
          message:
            "Only INFORMASI 4-6 criteria allowed for officer assessment (criteria 12-22)",
        });
      }

      const application = await Application.findByPk(id);

      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      if (application.status !== "draft") {
        return res.status(400).json({
          message: "Can only assess draft applications",
        });
      }

      // Save officer's assessment
      for (const item of scores) {
        const { criteriaId, scoreOptionId } = item;
        const criteria = await Criteria.findByPk(criteriaId);
        const scoreOption = await ScoreOption.findByPk(scoreOptionId);

        if (!criteria || !scoreOption) {
          continue;
        }

        const weightedScore = (scoreOption.score * criteria.weight) / 100;

        await ApplicationScore.create({
          applicationId: application.id,
          criteriaId,
          scoreOptionId,
          score: scoreOption.score,
          criteriaWeight: criteria.weight,
          weightedScore,
        });
      }

      // Calculate total score for all criteria (1-22)
      const allScores = await ApplicationScore.findAll({
        where: { applicationId: id },
        include: [{ model: Criteria, as: "criteria" }],
      });

      console.log("=== Calculating Total Score ===");
      console.log("Total application scores found:", allScores.length);

      const categoryScores = {};
      const categoryFinalScores = {};
      let totalScore = 0;

      for (const score of allScores) {
        const categoryId = score.criteria.categoryId;
        const weightedScore = parseFloat(score.weightedScore) || 0;

        console.log(
          `Score ID ${score.id}: categoryId=${categoryId}, weightedScore=${weightedScore}`
        );

        if (!categoryScores[categoryId]) {
          categoryScores[categoryId] = 0;
        }
        categoryScores[categoryId] += weightedScore;
      }

      console.log("Category Scores (Sum F×D):", categoryScores);

      for (const [categoryId, sumFD] of Object.entries(categoryScores)) {
        const category = await Category.findByPk(categoryId);
        const categoryWeight = parseFloat(category.weight) || 0;
        const finalScore = (sumFD * categoryWeight) / 100;

        console.log(
          `Category ${categoryId}: sumFD=${sumFD}, weight=${categoryWeight}, finalScore=${finalScore}`
        );

        categoryFinalScores[categoryId] = finalScore;
        totalScore += finalScore;
      }

      console.log("Total Score:", totalScore);

      await application.update({
        status: "assessed",
        categoryScores,
        categoryFinalScores,
        totalScore,
      });

      console.log("=== Assessment Completed ===");
      console.log("Total Score Calculated:", totalScore);
      console.log("Application after update:", {
        id: application.id,
        status: application.status,
        totalScore: application.totalScore,
      });

      res.status(200).json({
        message: "Assessment completed",
        data: {
          applicationNumber: application.applicationNumber,
          status: application.status,
          totalScore: application.totalScore,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async submitApplication(req, res, next) {
    try {
      console.log("=== Submit Application ===");
      console.log("User:", req.user);
      console.log("Body:", req.body);

      const { scores } = req.body;
      const userId = req.user.id;

      if (!scores || !Array.isArray(scores) || scores.length === 0) {
        console.log("Error: Scores data required");
        return res.status(400).json({ message: "Scores data required" });
      }

      const appNumber = `APP-${Date.now()}-${userId}`;
      const user = await User.findByPk(userId);
      console.log("User found:", user?.nama);

      const application = await Application.create({
        applicationNumber: appNumber,
        userId,
        applicantName: user.nama,
        status: "pending",
      });
      console.log("Application created:", application.id);

      const categoryScores = {};
      const categoryFinalScores = {};
      let totalScore = 0;

      for (const item of scores) {
        const { criteriaId, scoreOptionId } = item;
        const criteria = await Criteria.findByPk(criteriaId);
        const scoreOption = await ScoreOption.findByPk(scoreOptionId);

        if (!criteria || !scoreOption) {
          console.log(
            `Skip: criteria ${criteriaId} or option ${scoreOptionId} not found`
          );
          continue;
        }

        const weightedScore = (scoreOption.score * criteria.weight) / 100;

        await ApplicationScore.create({
          applicationId: application.id,
          criteriaId,
          scoreOptionId,
          score: scoreOption.score,
          criteriaWeight: criteria.weight,
          weightedScore,
        });

        if (!categoryScores[criteria.categoryId]) {
          categoryScores[criteria.categoryId] = 0;
        }
        categoryScores[criteria.categoryId] += weightedScore;
      }

      for (const [categoryId, sumFD] of Object.entries(categoryScores)) {
        const category = await Category.findByPk(categoryId);
        const finalScore = (sumFD * category.weight) / 100;
        categoryFinalScores[categoryId] = finalScore;
        totalScore += finalScore;
      }

      await application.update({
        categoryScores,
        categoryFinalScores,
        totalScore,
      });

      console.log("Final totalScore:", totalScore);

      res.status(201).json({
        message: "Application submitted",
        data: { applicationNumber: appNumber, totalScore },
      });
    } catch (error) {
      console.error("Error in submitApplication:", error);
      next(error);
    }
  }

  static async getApplications(req, res, next) {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;

      let whereClause = {};

      // User hanya bisa lihat aplikasi sendiri
      if (userRole === "user") {
        whereClause.userId = userId;
      }
      // Officer dan Admin bisa lihat semua aplikasi
      // Jika ingin filter status tertentu, tambahkan di query params

      const { status } = req.query;
      if (status) {
        whereClause.status = status;
      }

      const applications = await Application.findAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "nama", "email"],
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      res.status(200).json({ data: applications });
    } catch (error) {
      next(error);
    }
  }

  // New endpoint: Get draft applications for officers
  static async getDraftApplications(req, res, next) {
    try {
      const applications = await Application.findAll({
        where: { status: "draft" },
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "nama", "email", "tempatLahir", "tanggalLahir"],
          },
        ],
        order: [["createdAt", "ASC"]],
      });

      res.status(200).json({
        message: "Draft applications waiting for assessment",
        count: applications.length,
        data: applications,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getApplicationDetail(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const application = await Application.findOne({
        where: { id, userId },
        include: [
          {
            model: ApplicationScore,
            as: "scores",
            include: [
              {
                model: Criteria,
                as: "criteria",
                include: [{ model: Category, as: "category" }],
              },
              { model: ScoreOption, as: "scoreOption" },
            ],
          },
        ],
      });

      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      res.status(200).json({ data: application });
    } catch (error) {
      next(error);
    }
  }

  static async getApplicationReport(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Get application with all related data
      const application = await Application.findOne({
        where: { id, userId },
        include: [
          {
            model: ApplicationScore,
            as: "scores",
            include: [
              {
                model: Criteria,
                as: "criteria",
                include: [{ model: Category, as: "category" }],
              },
              {
                model: ScoreOption,
                as: "scoreOption",
              },
            ],
          },
        ],
      });

      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      // Group by category (INFORMASI 1-6)
      const reportByCategory = {};

      application.scores.forEach((score) => {
        const categoryId = score.criteria.category.id;
        const categoryName = score.criteria.category.name;
        const categoryWeight = score.criteria.category.weight;

        if (!reportByCategory[categoryId]) {
          reportByCategory[categoryId] = {
            categoryId,
            categoryName,
            categoryWeight,
            items: [],
            totalWeightedScore: 0,
            finalScore: 0,
          };
        }

        // Calculate F × D
        const F = score.score; // Score from option
        const D = score.criteriaWeight; // Criteria weight
        const FxD = score.weightedScore; // F × D (already calculated)

        reportByCategory[categoryId].items.push({
          criteriaName: score.criteria.name,
          criteriaWeight: D,
          selectedOption: score.scoreOption.description,
          score: F,
          weightedScore: FxD,
        });

        reportByCategory[categoryId].totalWeightedScore += FxD;
      });

      // Calculate final score per category (Sum(F×D) × B / 100)
      Object.keys(reportByCategory).forEach((categoryId) => {
        const category = reportByCategory[categoryId];
        category.finalScore =
          (category.totalWeightedScore * category.categoryWeight) / 100;
      });

      // Convert to array and sort by categoryId
      const report = Object.values(reportByCategory).sort(
        (a, b) => a.categoryId - b.categoryId
      );

      res.status(200).json({
        data: {
          applicationNumber: application.applicationNumber,
          applicantName: application.applicantName,
          totalScore: application.totalScore,
          createdAt: application.createdAt,
          report,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
module.exports = Controller;
