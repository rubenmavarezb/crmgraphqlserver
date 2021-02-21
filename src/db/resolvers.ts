import User, { UserI } from '../models/User';
import bcryptjs from 'bcryptjs';

interface Input {
    input: UserI
}

//Resolvers
const resolvers = {
    Query: {
        getCourses: () => 'Hola'
    },
    Mutation: {
        newUser: async (_: any, {input}:Input) => {
            
            const { email, password } = input;

            //Check if user is registrated

            const userExists = await User.findOne({email});

            if(userExists) {
                throw new Error('Mail already exists')
            }

            //Hash password
            const salt = await bcryptjs.genSalt(10);
            input.password = await bcryptjs.hash(password, salt);

            //Save user

            try {
                const user = new User(input);
                user.save();
                return user;
            } catch (error) {
                console.log(error)
            }
        }
    }
}

export default resolvers;