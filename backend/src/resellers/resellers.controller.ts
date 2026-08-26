import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ResellersService } from './resellers.service';
import {
  RegisterResellerDto,
  LoginResellerDto,
  ImportProductDto,
  UpdateResellerProductDto,
  UpgradeTierDto,
} from './dto/reseller.dto';
import { ResellerAuthGuard } from './guards/reseller.guard';

@Controller('resellers')
export class ResellersController {
  constructor(private readonly resellersService: ResellersService) {}

  @Post('register')
  register(@Body() dto: RegisterResellerDto) {
    return this.resellersService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginResellerDto) {
    return this.resellersService.login(dto);
  }

  @UseGuards(ResellerAuthGuard)
  @Get('me')
  getProfile(@Req() req: any) {
    return this.resellersService.getProfile(req.shop.shopId);
  }

  @UseGuards(ResellerAuthGuard)
  @Put('me')
  updateProfile(@Req() req: any, @Body() body: any) {
    return this.resellersService.updateProfile(req.shop.shopId, body);
  }

  @UseGuards(ResellerAuthGuard)
  @Post('upgrade-tier')
  upgradeTier(@Req() req: any, @Body() dto: UpgradeTierDto) {
    return this.resellersService.upgradeTier(req.shop.shopId, dto);
  }

  @UseGuards(ResellerAuthGuard)
  @Get('catalog')
  getCatalog(@Req() req: any) {
    return this.resellersService.getWholesaleCatalog(req.shop.shopId);
  }

  @UseGuards(ResellerAuthGuard)
  @Get('inventory')
  getInventory(@Req() req: any) {
    return this.resellersService.getInventory(req.shop.shopId);
  }

  @UseGuards(ResellerAuthGuard)
  @Post('inventory')
  importProduct(@Req() req: any, @Body() dto: ImportProductDto) {
    return this.resellersService.importProduct(req.shop.shopId, dto);
  }

  @UseGuards(ResellerAuthGuard)
  @Put('inventory/:id')
  updateInventoryItem(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateResellerProductDto,
  ) {
    return this.resellersService.updateInventoryItem(req.shop.shopId, id, dto);
  }

  @UseGuards(ResellerAuthGuard)
  @Delete('inventory/:id')
  removeInventoryItem(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.resellersService.removeInventoryItem(req.shop.shopId, id);
  }

  @UseGuards(ResellerAuthGuard)
  @Get('wallet')
  getWallet(@Req() req: any) {
    return this.resellersService.getWallet(req.shop.shopId);
  }

  @UseGuards(ResellerAuthGuard)
  @Post('wallet/withdraw')
  requestWithdrawal(@Req() req: any, @Body() body: any) {
    return this.resellersService.requestWithdrawal(req.shop.shopId, body);
  }

  @UseGuards(ResellerAuthGuard)
  @Get('orders')
  getOrders(@Req() req: any) {
    return this.resellersService.getOrders(req.shop.shopId);
  }

  @UseGuards(ResellerAuthGuard)
  @Get('messages')
  getMessages(@Req() req: any) {
    return this.resellersService.getMessages(req.shop.shopId);
  }

  @UseGuards(ResellerAuthGuard)
  @Post('messages/:id/read')
  markMessageRead(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.resellersService.markMessageRead(req.shop.shopId, id);
  }

  // Public Endpoints
  @Get('public/shops')
  getPublicShops() {
    return this.resellersService.getPublicShops();
  }

  @Get('public/shops/:handle')
  getPublicShopByHandle(@Param('handle') handle: string) {
    return this.resellersService.getPublicShopByHandle(handle);
  }

  @Post('public/visit/:handle')
  recordShopVisit(@Param('handle') handle: string) {
    return this.resellersService.recordShopVisit(handle);
  }

  @Post('public/message')
  sendMessage(@Body() body: any) {
    return this.resellersService.sendMessage(body);
  }
}


