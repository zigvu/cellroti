module EventsHelper

  def milliseconds_to_prettyprint(milliseconds)
    hh, mm, ss, ms = milliseconds_to_times(milliseconds)
    return "#{hh}:#{mm}:#{ss}::#{ms}"
  end

  def milliseconds_to_times(milliseconds)
    ss, ms = milliseconds.divmod(1000)
    mm, ss = ss.divmod(60)
    hh, mm = mm.divmod(60)
    _, hh = hh.divmod(24)
    return hh, mm, ss, ms
  end

  def times_to_milliseconds(hours, minutes, seconds, milliseconds)
    hh = hours == nil ? 0 : hours.to_i
    mm = minutes == nil ? 0 : minutes.to_i
    ss = seconds == nil ? 0 : seconds.to_i
    ms = milliseconds == nil ? 0 : milliseconds.to_i

    return Integer((((hh * 60) + mm) * 60 + ss) * 1000 + ms).to_i
  end

  def create_all_times
    @allHours = (1..24).to_a
    @allMinutes = (1..60).to_a
    @allSeconds = (1..60).to_a
    @allMilliSeconds = (1..1000).to_a
    return @allHours, @allMinutes, @allSeconds, @allMilliSeconds
  end
end
