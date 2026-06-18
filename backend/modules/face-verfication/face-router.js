import express from 'express'
import { authenticate } from '../auth/auth.middleware';
import { enrollFaceController, verifyFaceController } from './face-controller';

const faceRouter=express.Router();
faceRouter.post('/enroll',authenticate,enrollFaceController);
faceRouter.post('/verify',authenticate,verifyFaceController);