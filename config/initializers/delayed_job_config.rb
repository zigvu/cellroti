# config/initializers/delayed_job_config.rb

#Delayed::Worker.destroy_failed_jobs = false
#Delayed::Worker.sleep_delay = 60  <-- evan: uncomment
Delayed::Worker.max_attempts = 3
Delayed::Worker.max_run_time = 1.week # override in each job file
Delayed::Worker.read_ahead = 10
#Delayed::Worker.default_queue_name = 'default'
Delayed::Worker.delay_jobs = !Rails.env.test?
