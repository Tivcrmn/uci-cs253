import java.io.IOException;
import java.io.Reader;
import java.io.InputStreamReader;
import java.io.File;
import java.io.FileInputStream;
import java.util.List;
import java.util.ArrayList;
import java.util.Set;
import java.util.HashSet;
import java.util.Map;
import java.util.HashMap;
import java.util.Queue;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.Collections;
import java.util.Scanner;
import java.util.Map.Entry;
import java.nio.file.Files;
import java.nio.file.Paths;



class TwentyEightThree {
    
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
    
    static class Characters extends ActiveWFObject {
        private AllWords all_words;
        private CountAndSort count_and_sort;
        
        public void dispatch(List<Object> message) throws IOException {
    		String msg = (String) message.get(0);
    		if (msg.equals("init"))
    			init(args(message));
    	}
    	
    	public void init(List<Object> message) throws IOException {
    	    String path = (String) message.get(0);
    		all_words = (AllWords) message.get(1);
    		count_and_sort = (CountAndSort) message.get(2);
    		
    		File file = new File(path);
            Reader reader = null;
            try {
                reader = new InputStreamReader(new FileInputStream(file));
                int tempchar;
                while ((tempchar = reader.read()) != -1) {
                    if (((char) tempchar) != '\r') {
                        send(all_words, messageGene("readCharacter", (char) tempchar));
                    }
                }
                reader.close();
                send(all_words, messageGene("todie"));
                stop = true;
            } catch (Exception e) {
                e.printStackTrace();
            }
    	}
    }
    
    static class AllWords extends ActiveWFObject {
        private NonStopWords non_stop_words;
        private boolean start_char = true;
        private String word = "";
        
        public void dispatch(List<Object> message) throws IOException {
    		String msg = (String) message.get(0);
    		if (msg.equals("init"))
    			init(args(message));
    		else if (msg.equals("readCharacter"))
    			readCharacter(args(message));
    		else if (msg.equals("todie"))
    		    todie();
    	}
    	
    	public void init(List<Object> message) throws IOException {		
    		non_stop_words = (NonStopWords) message.get(0);
    	}
    	
    	public void readCharacter(List<Object> message) throws IOException {
    	    Character c = (Character) message.get(0);
    	    if (start_char) {
                word = "";
                if (Character.isLetterOrDigit(c)) {
                    word = (c + "").toLowerCase();
                    start_char = false;
                }
    	    } else {
                if (Character.isLetterOrDigit(c)) {
                    word += (c + "").toLowerCase();
                } else {
                    start_char = true;
                    send(non_stop_words, messageGene("addWord", word));
                } 
    	    }
    	} 
    	
    	public void todie() {
    	    stop = true;
    	    send(non_stop_words, messageGene("todie"));
    	}
    }
    
    static class NonStopWords extends ActiveWFObject {
        private CountAndSort count_and_sort;
        private Set<String> stop_words = new HashSet<>();
        
        public void dispatch(List<Object> message) throws IOException {
    		String msg = (String) message.get(0);
    		if (msg.equals("init"))
    			init(args(message));
    		else if (msg.equals("addWord"))
    			addWord(args(message));
    		else if (msg.equals("todie"))
    		    todie();
    	}
    	
    	public void init(List<Object> message) throws IOException {		
    		count_and_sort = (CountAndSort) message.get(0);
    		String[] words = new String(Files.readAllBytes(Paths.get("../stop_words.txt"))).split(",");
    		for (String w : words) stop_words.add(w);
    	}
    	
    	public void addWord(List<Object> message) throws IOException {
            String word = (String)message.get(0);
            if (!stop_words.contains(word) && word.length() > 1) {
                send(count_and_sort, messageGene("count_freqs", word));
            }
    	}
    	
    	public void todie() {
    	    stop = true;
    	    send(count_and_sort, messageGene("todie"));
    	}
    }
    
    static class CountAndSort extends ActiveWFObject {
        private Map<String, Integer> word_freqs = new HashMap<>();
        int i = 1;
        
        public void dispatch(List<Object> message) throws IOException {
    		String msg = (String) message.get(0);
    		if (msg.equals("count_freqs"))
    		    count_freqs(args(message));
    		else if (msg.equals("todie"))
    		    todie();
    	}
    	
    	public void count_freqs(List<Object> message) throws IOException {
    	    String word = (String) message.get(0);
    	    word_freqs.put(word, word_freqs.getOrDefault(word, 0) + 1);
    	    if (i % 5000 == 0) {
    	        sort(word_freqs);
    	    }
    	    i += 1;
    	}
    	
    	public void sort(Map<String, Integer> word_freqs) {
    	    System.out.println("----------------------------");
    	    List<Entry<String, Integer>> sorted = new ArrayList<Entry<String, Integer>>();
    	    sorted.addAll(word_freqs.entrySet());
    	    Collections.sort(sorted, (w1, w2) -> w2.getValue() - w1.getValue());
    	    for (int i = 0; i < 25; i++) {
    	    	Entry<String, Integer> p = sorted.get(i);
    	    	System.out.println(p.getKey() + " - " + p.getValue());
    	    }
    	}
    	
    	public void todie() {
    	    stop = true;
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
        CountAndSort count_and_sort = new CountAndSort();
		NonStopWords non_stop_words = new NonStopWords();
		AllWords all_words = new AllWords();
		Characters characters = new Characters();
		
        send(non_stop_words, messageGene("init", count_and_sort));
        send(all_words, messageGene("init", non_stop_words));
        send(characters, messageGene("init", args[0], all_words, count_and_sort));
        
		try {
			count_and_sort.join();
			non_stop_words.join();
			all_words.join();
			characters.join();
		} catch (InterruptedException e) {
			e.printStackTrace();
		}
    }   
}