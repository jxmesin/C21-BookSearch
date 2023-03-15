const { User, Book } = require('../models');
const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');


const resolvers = {
    Query: {
        me: async (parent, args, context) => 
        {
            if (context.user) {
                const userData = await User.findOne({ _id: context.user._id})
                .select('-__v -password')
                return userData;
            }
            throw new AuthenticationError('Not logged in!');
        }
    },
    Mutation: {
        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);

            return { token, user };
        },
        login: async (parent, {email, password }) => {
            const user = await User.findOne({ email });
            if(!user) {
                throw new AuthenticationError('Login information is incorrect')
            }
            const correctPw = await user.CorrectPassword
            (password);
            if(!correctPw) {
                throw new AuthenticationError('Login information is incorrect.')
            }
            const token = signToken(user);
            return { token, user };
        },
        saveBook: async (parent, { book }, conext) => {
            if (conext.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: contxt.user._id },
                    { $addToSet: {savedBooks: book } },
                    { new: true }
                )
                return updatedUser;
            }
            throw new AuthenticationError('You are not logged in.')
        },
        removeBook: async (parent, { bookId }, conext) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: conext.user._id } ,
                    { $pull: { savedBooks: { bookId: bookId } }},
                    { new: true },
                )
                return updatedUser;
            }
        }
    }
};

module.exports = resolvers;