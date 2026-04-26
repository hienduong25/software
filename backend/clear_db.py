from libs.database import db # Sửa lại đường dẫn import cho đúng

def clean():
    try:
        if db.is_closed():
            db.connect()
        print("--- 🧹 Đang dọn dẹp Database trên Aiven ---")
        
        # Tắt kiểm tra khóa ngoại
        db.execute_sql('SET FOREIGN_KEY_CHECKS = 0;')
        
        # Danh sách tổng hợp tất cả các bảng thừa từng xuất hiện
        tables = [
            'jobdescription', 'job_description', 'Job_description',
            'employer', 'Employer', 
            'jobseeker', 'job_seeker', 'JobSeeker',
            'user', 'User',
            'mytest', 'application', 'Application',
            'employers', 'job_seekers', 'jobs', 'applications' # Thêm cả bản số nhiều nếu bạn muốn xóa trắng làm lại từ đầu
        ]
        
        for table in tables:
            db.execute_sql(f'DROP TABLE IF EXISTS {table};')
            print(f"✅ Đã xóa bảng: {table}")
            
        db.execute_sql('SET FOREIGN_KEY_CHECKS = 1;')
        print("✨ Database đã sạch sẽ! Bây giờ bạn có thể chạy main.py để tạo cấu trúc mới.")
    except Exception as e:
        print(f"❌ Lỗi khi dọn dẹp: {e}")
    finally:
        if not db.is_closed():
            db.close()

if __name__ == "__main__":
    confirm = input("Hành động này sẽ xóa toàn bộ dữ liệu trên Cloud. Tiếp tục? (y/n): ")
    if confirm.lower() == 'y':
        clean()
    else:
        print("Đã hủy.")