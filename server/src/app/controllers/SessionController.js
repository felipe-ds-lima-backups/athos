import jwt from 'jsonwebtoken'
import * as Yup from 'yup'

import User from '../models/User'
import authConfig from '../../configs/auth'

class SessionController {
	async store(req, res) {
		const schema = Yup.object().shape({
			name: Yup.string().required(),
			email: Yup.string().email().required(),
			password: Yup.string().required().min(6),
		})

		if (!(await schema.isValid(req.body))) {
			return res.status(400).json({ error: 'Validation fails' })
		}

		const { email, password } = req.body

		const user = await User.findOne({ where: { email } })

		if (!user) {
			return res
				.status(401)
				.json({ error: 'E-mail or password does not match' })
		}

		if (!(await user.checkPassword(password))) {
			return res
				.status(401)
				.json({ error: 'E-mail or password does not match' })
		}

		const { id, name } = user

		return res.json({
			user: {
				id,
				name,
				email,
			},
			token: jwt.sign({ id }, authConfig.secret, {
				expiresIn: authConfig.expiresIn,
			}),
		})
	}
}

export default new SessionController()
