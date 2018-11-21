import java.io.IOException;
import java.util.List;
import java.util.ArrayList;
import java.util.Set;
import java.util.HashSet;
import java.util.Map;
import java.util.HashMap;
import java.util.Queue;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.Collections;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.regex.Pattern;
import java.util.Map.Entry;

class TwentyEight {
    
    static abstract class ActiveWFObject extends Thread {
    	public String name;
    	public Queue<List<Object>> queue;
    	public boolean stop;
    
    	public ActiveWFObject() {
    		name = this.getClass().getSimpleName();
    		queue = new LinkedBlockingQueue<List<Object>>();
    		stop = false;
    		this.start();
    	}
    	
    	public void run() {
    		while (!stop){
    			List<Object> message = queue.poll();
    			try {
    				if (message != null) {
    					dispatch(message);
    					String msg = (String) message.get(0);
    					if (msg.equals("die")) stop = true;
    				}
    			} catch (IOException e) {
    				e.printStackTrace();
    			}
    		}
    	}
    	
    	public abstract void dispatch(List<Object> message) throws IOException;
    }
    
    static class DataStorageManager extends ActiveWFObject {
    	private StopWordManager stopWordManager;
    	private String data;
    	
    	public void dispatch(List<Object> message) throws IOException {
    		String msg = (String) message.get(0);
    		if (msg.equals("init"))
    			init(args(message));
    		else if (msg.equals("send_word_freqs"))
    			processWords(args(message));
    		else
    			send(stopWordManager, message);
    	}
    	
    	public void init(List<Object> message) throws IOException {		
    		String path = (String) message.get(0);
    		stopWordManager = (StopWordManager) message.get(1);
    		data = new String(Files.readAllBytes(Paths.get(path))).toLowerCase();
    		data = Pattern.compile("[^a-zA-Z]").matcher(data).replaceAll(" ");
    	}
    	
    	public void processWords(List<Object> message) {
    		String[] words = data.split(" ");
            WordFrequencyManager recipient = (WordFrequencyManager)message.get(0);
    		for (String w : words) {
    		    if (w.length() < 2) continue;
    		    send(stopWordManager, messageGene("filter", w));
    		}
    		send(stopWordManager,  messageGene("top25", recipient));
    	}
    }
    
    static class StopWordManager extends ActiveWFObject {
    	private Set<String> stopWords = new HashSet<String>();
    	private WordFrequencyManager wordFreqManager;
    	
    	public void dispatch(List<Object> message) throws IOException {
    		String msg = (String) message.get(0);
    		if (msg.equals("init"))
    			init(args(message));
    		else if (msg.equals("filter"))
    			filter(args(message));
    		else
    			send(wordFreqManager, message);
    	}
    	
    	public void init(List<Object> message) throws IOException {
    		String[] words = new String(Files.readAllBytes(Paths.get("../stop_words.txt"))).split(",");
    		for (String w : words) stopWords.add(w);
    		wordFreqManager = (WordFrequencyManager) message.get(0);
    	}
    	
    	public void filter(List<Object> message) {
    		String word = (String) message.get(0);
    		if (!stopWords.contains(word))
    			send(wordFreqManager, messageGene("word", word));
    	}
    }
    
    static class WordFrequencyManager extends ActiveWFObject {
        private DataStorageManager dataStorageManager;
    	private Map<String, Integer> word_freqs = new HashMap<String, Integer>();
    	
    	public void dispatch(List<Object> message) {
    		String msg = (String) message.get(0);
    		if (msg.equals("word"))
    			incrementCount(args(message));
    		else if (msg.equals("top25"))
    			top25(args(message));
    		else if (msg.equals("run"))
    		    run(args(message));
    		    
    	}
    	
    	public void incrementCount(List<Object> message) {
    		String w = (String) message.get(0);
    		if (word_freqs.containsKey(w))
    			word_freqs.put(w, word_freqs.get(w) + 1);
    		else
    			word_freqs.put(w, 1);
    	}
    	
    	public void top25(List<Object> message) {
    	    List<Entry<String, Integer>> sorted = new ArrayList<Entry<String, Integer>>();
    	    sorted.addAll(word_freqs.entrySet());
    
    	    Collections.sort(sorted, (w1, w2) -> w2.getValue() - w1.getValue());
    	    for (int i = 0; i < 25; i++) {
    	    	Entry<String, Integer> p = sorted.get(i);
    	    	System.out.println(p.getKey() + " - " + p.getValue());
    	    }
    	    send(dataStorageManager,  messageGene("die"));
    	    stop = true;
    	}
    	
    	public void run(List<Object> message) {
    		dataStorageManager = (DataStorageManager) message.get(0);
    		send(dataStorageManager, messageGene("send_word_freqs", this));
    	}
    }
    
	// there are two helper functions for compose and decompose in Java
	
	// 1. wrapper for message
	static List<Object> messageGene(String msg, Object...args) {
		List<Object> message = new ArrayList<Object>();
		message.add(msg);
		for (Object arg : args) {
		    message.add(arg);
		}
		return message;
	}
	
	// 2. decompose the args
	static List<Object> args(List<Object> message) {
    	return message.subList(1, message.size());
    }
    
	static void send(ActiveWFObject receiver, List<Object> message) {
		receiver.queue.offer(message);
	}
	
    public static void main(String args[]) {
        WordFrequencyManager word_freq_manager = new WordFrequencyManager();
		
		StopWordManager stop_word_manager = new StopWordManager();
		send(stop_word_manager, messageGene("init", word_freq_manager));
		
		DataStorageManager storage_manager = new DataStorageManager();
		send(storage_manager, messageGene("init", args[0], stop_word_manager));
		
		send(word_freq_manager, messageGene("run", storage_manager));
		
		try {
			word_freq_manager.join();
			stop_word_manager.join();
			storage_manager.join();
		} catch (InterruptedException e) {
			e.printStackTrace();
		}
    }   
}