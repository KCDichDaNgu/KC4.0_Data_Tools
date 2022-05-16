# Thư mục chứa đoạn mã nguồn có nhiệm vụ kiểm thử API

- Thêm mới BEAR_TOKEN trong file .env
- Thực hiện chạy `python -m unittest` để chạy toàn bộ các unit test trong thư mục tests. Nếu muốn chạy riêng từng unit test, chúng ta cần thực hiện trên từng thư mục, câu lệnh mẫu `python -m tests.admin.main`
- Đo đạt kết quả bao phủ, chúng ta thực hiện lần lượt hai câu lệnh `coverage run -m unittest` để tiến hành chạy và `coverage report` để xem báo cáo kết quả bao phủ. 