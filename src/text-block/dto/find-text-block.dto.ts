import { PartialType } from "@nestjs/mapped-types";
import { IsNumber, IsOptional } from "class-validator";
import { CreateTextBlockDto } from "./create-text-block.dto";

export class FindTextBlockDto extends PartialType(CreateTextBlockDto){
  @IsOptional()
  @IsNumber()
  id: number;
}
