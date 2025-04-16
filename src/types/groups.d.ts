export interface Groups {
    _id: ObjectId;
    name: string;
    description?: string;
    autoStart?: boolean;
    ownerId: ObjectId; // Chủ hụi
    amountPerCycle: number; // Số tiền mỗi kỳ
    cycleDuration: number; // Thời gian mỗi kỳ (đơn vị: ngày)
    cycleUnit?: 'day' | 'week' | 'month'; // Đơn vị thời gian
    totalCycles: number; // Tổng số kỳ
    currentCycle?: number; // Kỳ hiện tại (tự động tính toán từ startDate)
    startDate: Date; // ngày bắt đầu
    endDate: Date; // tự động tính toán từ startDate + (totalCycles * cyclePeriodInDays)
    status: 'active' | 'inactive' | 'completed'; // Trạng thái dây hụi
    createdAt: Date;
    updatedAt: Date;
}