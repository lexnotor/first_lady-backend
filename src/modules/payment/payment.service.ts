import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PaiementEntity } from "../order/order.entity";
import { FindOneOptions, Repository } from "typeorm";

@Injectable()
export class PaymentService {
    constructor(
        @InjectRepository(PaiementEntity)
        private readonly paiementRepo: Repository<PaiementEntity>
    ) {}

    async getPaiementById(id: string): Promise<PaiementEntity> {
        let paiement: PaiementEntity;
        const filter: FindOneOptions<PaiementEntity> = {};
        filter.where = { id };

        try {
            paiement = await this.paiementRepo.findOneOrFail(filter);
        } catch (error) {
            throw new HttpException("PAIEMENT_NOT_FOUND", HttpStatus.NOT_FOUND);
        }

        return paiement;
    }

    async getPaiementBySession(session_id: string): Promise<PaiementEntity> {
        let paiement: PaiementEntity;
        const filter: FindOneOptions<PaiementEntity> = {};
        filter.where = { session_id: session_id };

        try {
            paiement = await this.paiementRepo.findOneOrFail(filter);
        } catch (error) {
            throw new HttpException("PAIEMENT_NOT_FOUND", HttpStatus.NOT_FOUND);
        }

        return paiement;
    }

    async initPaiement(
        session_id: string,
        session_data: object,
        order_data: object,
        user: string
    ): Promise<PaiementEntity> {
        const paiement = new PaiementEntity();

        paiement.order_data = order_data;
        paiement.session_data = session_data;
        paiement.session_id = session_id;
        paiement.status = "PENDING";
        paiement.user = user;
        paiement.type = "STRIPE";

        try {
            await this.paiementRepo.save(paiement);
        } catch (error) {
            throw new HttpException(
                "PAIEMENT_REQUIMENT_FAIL",
                HttpStatus.NOT_ACCEPTABLE
            );
        }

        return paiement;
    }

    async confirmPaiement(
        session_id: string,
        paiement_data: any
    ): Promise<PaiementEntity> {
        const paiement = await this.getPaiementBySession(session_id);

        paiement.paiement_data = paiement_data;

        try {
            await this.paiementRepo.save(paiement);
        } catch (error) {
            throw new HttpException(
                "PAIEMENT_NOT_CONFIRMED",
                HttpStatus.NOT_MODIFIED
            );
        }

        return paiement;
    }
}
