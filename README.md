# exam_system
Providing a platform for users to attend exams on this portal, where they can view results, detailed analysis, and the leaderboard.


-----------------------

User : 

1. 
name - test
email - test@example.com
password - password

2. 
name - Akash Markad
email - akash@example.com
password - password

------------------------

admin

1. 
admin name
admin@exam.com
admin123
----------------------------------

user

user@exam.com
password
----------------------------------

user1

user1@exam.com
password
----------------------------------


Redis Configuration : 


WSL --> 

1. Install Redis in WSL

> sudo apt update
> sudo apt install redis-server -y

2. Start Redis

> sudo service redis-server start

3. Test Redis

> redis-cli ping

Output should be: PONG

4. Enable Redis on startup (optional)

> sudo systemctl enable redis-server

5. Check Redis status

> sudo systemctl status redis-server

