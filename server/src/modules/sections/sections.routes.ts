import { Router } from 'express'
import * as sectionsService from './sections.service.js'

export const sectionsRouter = Router()

sectionsRouter.get('/', async (_req, res, next) => {
  try {
    const sections = await sectionsService.listSections()
    res.json(sections)
  } catch (err) {
    next(err)
  }
})
