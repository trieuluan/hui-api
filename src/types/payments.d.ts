import { ObjectId } from 'mongodb';

export type PaymentStatus = 'pending' | 'completed' | 'overdue';

export interface Payments {
    _id: ObjectId;
    groupId: ObjectId;          // ID của dây hụi liên quan
    cycleNumber: number;        // Số thứ tự kỳ hụi (1,2,3...)
    memberId: ObjectId;         // ID thành viên đóng hụi
    amount: number;             // Số tiền cần đóng của kỳ này
    dueDate: Date;              // Ngày phải đóng tiền
    paidAt?: Date;              // Ngày thực tế thành viên đã đóng tiền
    status: PaymentStatus;      // Trạng thái đóng tiền (chưa đóng, đã đóng, quá hạn)
    notes?: string;             // Ghi chú thêm (nếu có)

    createdAt: Date;            // Ngày tạo bản ghi
    updatedAt: Date;            // Ngày cập nhật lần cuối
}
