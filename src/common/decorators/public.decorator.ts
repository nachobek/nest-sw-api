import { SetMetadata } from '@nestjs/common';
import Constant from '../enums/constant.enum';

export const Public = () => SetMetadata(Constant.IS_PUBLIC_KEY, true);
