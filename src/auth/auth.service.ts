import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt'
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {}

    async signUp(authCrentialsDto: AuthCredentialsDto): Promise<void> {
        const { username, password } = authCrentialsDto;

        const salt = await bcrypt.genSalt()

        const existingUser = await this.userRepository.findOne({ where: { username } });

        if (existingUser) {
            throw new ConflictException('Username already exists');
        }

        const user = new User();
        user.username = username;
        user.salt = salt;
        user.password = await this.hashPassword(password , salt);

        console.log(user.password);
        await this.userRepository.save(user);
    }

    private async hashPassword(password: string, salt: string): Promise<string> {
      return bcrypt.hash(password, salt);
    }
}
