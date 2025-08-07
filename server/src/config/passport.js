import passport from 'passport';
import googleStrategy from './passport/google.js';
import githubStrategy from './passport/github.js';

googleStrategy(passport);
githubStrategy(passport);

export default passport;
