# -*- coding: utf-8 -*-
"""
项目启动入口
- 启动Flask后端服务
"""

from app import create_app

app = create_app()

if __name__ == "__main__":
    # TODO: 可根据需要设置host、port、debug等参数
    app.run(host="0.0.0.0", port=5000, debug=True)
