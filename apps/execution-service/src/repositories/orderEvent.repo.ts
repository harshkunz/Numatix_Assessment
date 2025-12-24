import { prisma } from '../config/db';

export const OrderEventRepo = {
  async create(data: any) {
    return prisma.orderEvent.create({ data });
  },
};
