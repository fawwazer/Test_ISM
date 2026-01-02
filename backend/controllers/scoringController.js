const { Category, Criteria, ScoreOption } = require("../models");

class ScoringController {
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
}

module.exports = ScoringController;
