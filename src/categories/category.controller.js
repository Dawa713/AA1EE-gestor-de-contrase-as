const models = require("../../db/models")

async function findAll(req, res) {
  res.send(await models.Category.findAll())
}

async function findOne(req, res) {
  let category = await models.Category.findByPk(req.params.id, { include: { model: models.Site, as: 'sites'  } })
  if (category)
    res.send(category)
  else
    res.sendStatus(404)
}

async function add(req, res) {
  let result = await models.Category.build(req.body)
  await result.save()
  res.send(result)
}

async function deleteOne(req, res) {
  try {
    let category = await models.Category.findByPk(req.params.id)

    if (!category)
      return res.sendStatus(404)

    await category.destroy()
    res.sendStatus(200)
  } catch (error) {
    console.error('Error deleting category:', error)
    res.status(500).send({ error: 'Error deleting category' })
  }
}

function init(app) {
  app.get('/categories', findAll)
  app.get('/categories/:id', findOne)
  app.post('/categories', add)
  app.delete('/categories/:id', deleteOne)
}

module.exports = {
  init
}