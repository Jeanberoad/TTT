import { Router, type IRouter } from "express";
import healthRouter from "./health";
import hotspotRouter from "./hotspot";
import testMvolaRouter from "./testMvola";
import mvolaCallbackRouter from "./mvolaCallback";

const router: IRouter = Router();

router.use(healthRouter);
router.use(hotspotRouter);
router.use(mvolaCallbackRouter);
router.use(testMvolaRouter);

export default router;
