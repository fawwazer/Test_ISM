const {
  User,
  Category,
  Criteria,
  ScoreOption,
  Application,
  ApplicationScore,
} = require("../models");
const { getRiskCategory } = require("../helpers/riskCategory");

class OfficerController {
  static async getUsers(req, res, next) {
    try {
      const users = await User.findAll({
        where: { role: "user" },
        attributes: [
          "id",
          "nama",
          "email",
          "tempatLahir",
          "tanggalLahir",
          "jenisKelamin",
          "kodePos",
          "alamat",
        ],
        order: [["createdAt", "DESC"]],
      });

      res.status(200).json({ data: users });
    } catch (error) {
      next(error);
    }
  }

  static async createApplication(req, res, next) {
    try {
      const { userId, userManualData, applicantName, scores } = req.body;
      const officerId = req.user.id;

      if (!userId && !userManualData) {
        return res.status(400).json({
          message: "Either userId or userManualData is required",
        });
      }

      if (userId && userManualData) {
        return res.status(400).json({
          message: "Cannot provide both userId and userManualData",
        });
      }

      if (userId) {
        const user = await User.findByPk(userId);
        if (!user || user.role !== "user") {
          return res.status(404).json({ message: "User not found" });
        }
      }

      if (userManualData) {
        const requiredFields = ["nama", "email"];
        for (const field of requiredFields) {
          if (!userManualData[field]) {
            return res.status(400).json({
              message: `userManualData.${field} is required`,
            });
          }
        }
      }

      const finalApplicantName =
        applicantName ||
        (userId ? (await User.findByPk(userId)).nama : userManualData.nama);

      if (!scores || !Array.isArray(scores) || scores.length === 0) {
        return res.status(400).json({ message: "Scores data required" });
      }

      if (scores.length !== 22) {
        return res.status(400).json({
          message: "All 22 criteria must be filled (INFORMASI 1-6)",
        });
      }

      const appNumber = `APP-${Date.now()}-${officerId}`;

      const application = await Application.create({
        applicationNumber: appNumber,
        userId: userId || null,
        userManualData: userManualData || null,
        applicantName: finalApplicantName,
        status: "assessed",
      });

      const categoryScores = {};
      const categoryFinalScores = {};
      let totalScore = 0;

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

        const categoryId = criteria.categoryId;
        if (!categoryScores[categoryId]) {
          categoryScores[categoryId] = 0;
        }
        categoryScores[categoryId] += weightedScore;
      }

      for (const [categoryId, sumFD] of Object.entries(categoryScores)) {
        const category = await Category.findByPk(categoryId);
        const categoryWeight = parseFloat(category.weight) || 0;
        const finalScore = (sumFD * categoryWeight) / 100;

        categoryFinalScores[categoryId] = finalScore;
        totalScore += finalScore;
      }

      const riskCategory = getRiskCategory(totalScore);

      await application.update({
        categoryScores,
        categoryFinalScores,
        totalScore,
        riskCategory,
      });

      res.status(201).json({
        message: "Application created and assessed successfully",
        data: {
          applicationNumber: appNumber,
          applicationId: application.id,
          applicantName: finalApplicantName,
          userId: userId || null,
          userManualData: userManualData || null,
          status: application.status,
          totalScore: application.totalScore,
          riskCategory: application.riskCategory,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getApplications(req, res, next) {
    try {
      const { status } = req.query;
      let whereClause = {};

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

  static async getApplicationDetail(req, res, next) {
    try {
      const { id } = req.params;

      const application = await Application.findOne({
        where: { id },
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

      const application = await Application.findOne({
        where: { id },
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

      const reportByCategory = {};

      application.scores.forEach((score) => {
        const categoryId = score.criteria.category.id;
        const categoryName = score.criteria.category.name;
        const categoryWeight = parseFloat(score.criteria.category.weight);

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

        const F = parseInt(score.score);
        const D = parseFloat(score.criteriaWeight);
        const FxD = parseFloat(score.weightedScore);

        reportByCategory[categoryId].items.push({
          criteriaName: score.criteria.name,
          criteriaWeight: D,
          selectedOption: score.scoreOption.description,
          score: F,
          weightedScore: FxD,
        });

        reportByCategory[categoryId].totalWeightedScore += FxD;
      });

      Object.keys(reportByCategory).forEach((categoryId) => {
        const category = reportByCategory[categoryId];
        category.finalScore =
          (category.totalWeightedScore * category.categoryWeight) / 100;
      });

      const report = Object.values(reportByCategory).sort(
        (a, b) => a.categoryId - b.categoryId
      );

      res.status(200).json({
        data: {
          applicationNumber: application.applicationNumber,
          applicantName: application.applicantName,
          totalScore: application.totalScore,
          riskCategory: application.riskCategory,
          createdAt: application.createdAt,
          report,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateApplication(req, res, next) {
    try {
      const { id } = req.params;
      const { applicantName, scores } = req.body;

      if (!scores || !Array.isArray(scores) || scores.length === 0) {
        return res.status(400).json({ message: "Scores data required" });
      }

      if (scores.length !== 22) {
        return res.status(400).json({
          message: "All 22 criteria must be filled (INFORMASI 1-6)",
        });
      }

      const application = await Application.findByPk(id);

      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      await ApplicationScore.destroy({
        where: { applicationId: id },
      });

      const categoryScores = {};
      const categoryFinalScores = {};
      let totalScore = 0;

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

        const categoryId = criteria.categoryId;
        if (!categoryScores[categoryId]) {
          categoryScores[categoryId] = 0;
        }
        categoryScores[categoryId] += weightedScore;
      }

      for (const [categoryId, sumFD] of Object.entries(categoryScores)) {
        const category = await Category.findByPk(categoryId);
        const categoryWeight = parseFloat(category.weight) || 0;
        const finalScore = (sumFD * categoryWeight) / 100;

        categoryFinalScores[categoryId] = finalScore;
        totalScore += finalScore;
      }

      const riskCategory = getRiskCategory(totalScore);

      const updateData = {
        categoryScores,
        categoryFinalScores,
        totalScore,
        riskCategory,
      };

      if (applicantName) {
        updateData.applicantName = applicantName;
      }

      await application.update(updateData);

      res.status(200).json({
        message: "Application updated successfully",
        data: {
          applicationNumber: application.applicationNumber,
          applicationId: application.id,
          applicantName: application.applicantName,
          status: application.status,
          totalScore: application.totalScore,
          riskCategory: application.riskCategory,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteApplication(req, res, next) {
    try {
      const { id } = req.params;

      const application = await Application.findByPk(id);

      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      await ApplicationScore.destroy({
        where: { applicationId: id },
      });

      await application.destroy();

      res.status(200).json({
        message: "Application deleted successfully",
        data: {
          applicationId: id,
          applicationNumber: application.applicationNumber,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = OfficerController;
