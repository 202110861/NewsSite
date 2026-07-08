import { Router } from 'express'
import { adminOnly } from '../../middlewares/adminOnly.middleware.js'
import { authMiddleware } from '../../middlewares/auth.middleware.js'
import * as adsService from './ads.service.js'
import { createAdSchema, updateAdSchema } from './ads.service.js'

export const adsRouter = Router()

adsRouter.get('/slots/:slotKey', async (req, res, next) => {
  try {
    const ad = await adsService.getActiveAdBySlot(req.params.slotKey)
    if (!ad) {
      res.status(404).json({ message: '활성 광고가 없습니다.' })
      return
    }
    res.json(ad)
  } catch (err) {
    next(err)
  }
})

adsRouter.post('/:id/impression', async (req, res, next) => {
  try {
    const ad = await adsService.recordImpression(req.params.id)
    res.json(ad)
  } catch (err) {
    next(err)
  }
})

adsRouter.post('/:id/click', async (req, res, next) => {
  try {
    const ad = await adsService.recordClick(req.params.id)
    res.json(ad)
  } catch (err) {
    next(err)
  }
})

export const adminAdsRouter = Router()
adminAdsRouter.use(authMiddleware, adminOnly)

adminAdsRouter.get('/', async (_req, res, next) => {
  try {
    const ads = await adsService.listAdminAds()
    res.json(ads)
  } catch (err) {
    next(err)
  }
})

adminAdsRouter.post('/', async (req, res, next) => {
  try {
    const input = createAdSchema.parse(req.body)
    const ad = await adsService.createAd(input)
    res.status(201).json(ad)
  } catch (err) {
    next(err)
  }
})

adminAdsRouter.patch('/:id', async (req, res, next) => {
  try {
    const input = updateAdSchema.parse(req.body)
    const ad = await adsService.updateAd(req.params.id, input)
    res.json(ad)
  } catch (err) {
    next(err)
  }
})

adminAdsRouter.delete('/:id', async (req, res, next) => {
  try {
    await adsService.deleteAd(req.params.id)
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})
