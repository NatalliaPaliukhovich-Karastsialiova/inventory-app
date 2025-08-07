import { Router } from "express";
import passport from 'passport';
import { loginWebUser, registerWebUser, socialCallbackController } from "../controllers/authController.js";

const router = Router();

router.post("/web/register", registerWebUser);
router.post("/web/login", loginWebUser);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  socialCallbackController
);

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback',
  passport.authenticate('github', { session: false }),
  socialCallbackController
);

export default router;
