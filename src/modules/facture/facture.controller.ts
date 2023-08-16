import { Controller, Get, Param } from "@nestjs/common";
import { FactureService } from "./facture.service";

@Controller("facture")
export class FactureController {
    constructor(private readonly factureService: FactureService) {}

    @Get(":id")
    getFacture(@Param("id") orderId: string) {
        return this.factureService.getOrderFacture(orderId);
    }
}
