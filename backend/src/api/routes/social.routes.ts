import { Router } from 'express';
import socialController from '../controllers/social.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Follow/unfollow require authentication
router.post('/follow/:userId', authenticate, socialController.followUser);
router.delete('/follow/:userId', authenticate, socialController.unfollowUser);

// Get followers/following (public)
router.get('/followers/:userId', socialController.getFollowers);
router.get('/following/:userId', socialController.getFollowing);

// Friend feed requires authentication
router.get('/feed/friends', authenticate, socialController.getFriendFeed);

// User profile (public, but shows follow status if authenticated)
router.get('/profile/:userId', socialController.getUserProfile);

// Search users
router.get('/search', socialController.searchUsers);

// Suggestions and popular users require authentication
router.get('/suggestions', authenticate, socialController.getSuggestedUsers);
router.get('/popular', socialController.getPopularUsers);

export default router;
