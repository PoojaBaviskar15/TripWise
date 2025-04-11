import express from 'express';
import dotenv from 'dotenv';
import userRouter from './routes/user.route.js'


dotenv.config();

const app = express();

app.listen(3000, () => {
    console.log('Server is running on port 3000!')
})

app.use('/auth/vi', userRouter);