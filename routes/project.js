const express = require("express")
const router = express.Router()
const Project = require("../modelda/Project")

router.post("/create", async (req, res) => {
  const { name, monetizationMode, customRules } = req.body
  const project = await Project.create({
    owner: req.user._id,
    name,
    monetizationMode,
    customRules: monetizationMode === "customRules" ? customRules || [] : []
  })
  res.json(project)
})

router.post("/:id/addRevenue", async (req, res) => {
  const { amount } = req.body
  const project = await Project.findById(req.params.id)
  if (!project) return res.status(404).json({ error: "Not found" })
  project.revenuePool += amount
  await project.save()
  res.json({ revenuePool: project.revenuePool })
})

module.exports = router